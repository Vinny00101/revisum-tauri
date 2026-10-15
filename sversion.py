"""Compatibility entrypoint; Node is the single version synchronizer."""
from pathlib import Path
import subprocess
import sys

raise SystemExit(subprocess.call(["node", str(Path(__file__).parent / "scripts" / "version.mjs"), *sys.argv[1:]]))
