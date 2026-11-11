#!/usr/bin/env python3
"""Servidor local de Brote Studio. Solo biblioteca estándar; sin red externa."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse
import webbrowser

root = Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description='Abrir Brote Studio en este equipo')
parser.add_argument('--port', type=int, default=8000)
parser.add_argument('--no-open', action='store_true')
args = parser.parse_args()
server = None
for port in range(args.port, args.port + 20):
    try:
        server = ThreadingHTTPServer(('127.0.0.1', port), partial(SimpleHTTPRequestHandler, directory=str(root)))
        break
    except OSError:
        continue
if server is None:
    raise SystemExit('No hay un puerto libre. Prueba: python3 server.py --port 9000')
url = f'http://127.0.0.1:{server.server_port}/'
print(f'Brote Studio: {url}\nDeja esta ventana abierta. Pulsa Ctrl+C para detenerlo.', flush=True)
if not args.no_open:
    webbrowser.open(url)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
