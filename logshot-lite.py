import os, json
from flask import Flask, request, Response, jsonify
from kubernetes import client, config
from kubernetes.client.rest import ApiException

app = Flask(__name__)

TOKEN = os.getenv("LOGSHOT_TOKEN", "")
BIND  = os.getenv("LOGSHOT_BIND", "0.0.0.0:9099")
MAXN  = int(os.getenv("MAX_LINES", "1000"))
DEFAULT_NS = os.getenv("DEFAULT_NAMESPACE", "default")

def check_auth():
    if TOKEN == "":
        return True
    return request.headers.get("Authorization", "") == f"Bearer {TOKEN}"

@app.before_request
def _auth():
    if request.path in ["/healthz"]:
        return
    if not check_auth():
        return Response("Unauthorized", status=401)

# Load K8s config (in cluster)
config.load_incluster_config()
v1 = client.CoreV1Api()

@app.get("/healthz")
def healthz():
    return "ok"

@app.get("/pods")
def pods():
    """
    GET /pods?namespace=monitoring
    """
    ns = request.args.get("namespace", DEFAULT_NS)
    try:
        plist = v1.list_namespaced_pod(ns)
    except ApiException as e:
        return Response(json.dumps({"error": e.reason}), status=e.status, mimetype="application/json")

    items = []
    for p in plist.items:
        containers = [c.name for c in (p.spec.containers or [])]
        items.append({
            "name": p.metadata.name,
            "namespace": ns,
            "node": p.spec.node_name,
            "phase": p.status.phase,
            "containers": containers
        })
    return Response(json.dumps(items), mimetype="application/json")

def get_pod_logs(namespace: str, pod: str, container: str | None, n: int):
    try:
        txt = v1.read_namespaced_pod_log(
            name=pod,
            namespace=namespace,
            container=container,
            tail_lines=n,
            timestamps=True
        )
    except ApiException as e:
        raise Exception(f"{e.status} {e.reason}: {e.body}")

    lines = txt.splitlines()
    parsed = [{"ts": ln.split(" ", 1)[0],
               "line": ln.split(" ", 1)[1] if " " in ln else ""} for ln in lines]
    return parsed

@app.get("/logs")
def logs():
    """
    GET /logs?namespace=monitoring&pod=my-pod&container=app&n=200&format=text
    """
    ns = request.args.get("namespace", DEFAULT_NS)
    pod = request.args.get("pod", "")
    container = request.args.get("container")  # optional
    n = min(int(request.args.get("n", "100")), MAXN)
    plain = request.args.get("format", "") == "text"

    if not pod:
        return Response(json.dumps({"error": "pod required"}), status=400, mimetype="application/json")

    try:
        lines = get_pod_logs(ns, pod, container, n)
    except Exception as e:
        return Response(json.dumps({"error": str(e)}), status=404, mimetype="application/json")

    if plain:
        text = "\n".join([f"[{l['ts']}] {l['line']}" for l in lines])
        return Response(text, mimetype="text/plain")

    return Response(json.dumps({
        "namespace": ns,
        "pod": pod,
        "container": container or "",
        "count": len(lines),
        "lines": lines
    }), mimetype="application/json")

@app.get("/tail")
def tail():
    return logs()

if __name__ == "__main__":
    host, port = BIND.split(":")
    app.run(host=host, port=int(port))
