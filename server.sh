#!/bin/bash

# ==============================================================================
# AI Timetable Preparation - Server Controller Script
# Usage:
#   ./server.sh start [PORT]   - Start the local server in the background (default: 3000)
#   ./server.sh stop [PORT]    - Stop the running server
#   ./server.sh restart [PORT] - Restart the server
#   ./server.sh status [PORT]  - Check if the server is currently running
# ==============================================================================

PORT="${2:-3000}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$ROOT_DIR/aac"
PID_FILE="$ROOT_DIR/.server_${PORT}.pid"
LOG_FILE="$ROOT_DIR/.server_${PORT}.log"

get_port_pid() {
  lsof -ti :"$PORT" 2>/dev/null | head -n 1
}

is_running() {
  local p_pid=$(get_port_pid)
  if [ -n "$p_pid" ]; then
    return 0
  fi
  if [ -f "$PID_FILE" ]; then
    local pid=$(cat "$PID_FILE")
    if [ -n "$pid" ] && ps -p "$pid" > /dev/null 2>&1; then
      return 0
    fi
  fi
  return 1
}

start_server() {
  local existing_pid=$(get_port_pid)
  if [ -n "$existing_pid" ]; then
    echo "🟢 Server is already ACTIVE on http://localhost:$PORT (PID: $existing_pid)"
    echo "$existing_pid" > "$PID_FILE"
    return 0
  fi

  echo "🚀 Starting AI Timetable Server on http://localhost:$PORT ..."
  
  # Run Python 3 HTTP server serving the 'aac' directory
  (cd "$APP_DIR" && python3 -m http.server "$PORT" > "$LOG_FILE" 2>&1) &
  local new_pid=$!
  echo "$new_pid" > "$PID_FILE"

  sleep 1.5

  local active_pid=$(get_port_pid)
  if [ -n "$active_pid" ]; then
    echo "✅ Server started successfully!"
    echo "🌐 Local URL: http://localhost:$PORT"
    echo "📄 Log file:  $LOG_FILE"
    echo "⚡ PID:       $active_pid"

    # Open default browser on macOS if available
    if command -v open >/dev/null 2>&1; then
      open "http://localhost:$PORT" 2>/dev/null || true
    fi
  else
    echo "❌ Failed to start server on port $PORT. Checking logs:"
    cat "$LOG_FILE" 2>/dev/null
    return 1
  fi
}

stop_server() {
  local p_pid=$(get_port_pid)
  local file_pid=""
  if [ -f "$PID_FILE" ]; then
    file_pid=$(cat "$PID_FILE")
  fi

  local target_pid="${p_pid:-$file_pid}"

  if [ -z "$target_pid" ]; then
    echo "ℹ️  No running server found on port $PORT."
    rm -f "$PID_FILE"
    return 0
  fi

  echo "🛑 Stopping server on port $PORT (PID: $target_pid)..."
  kill "$target_pid" 2>/dev/null
  sleep 1

  if ps -p "$target_pid" > /dev/null 2>&1; then
    kill -9 "$target_pid" 2>/dev/null
    sleep 0.5
  fi

  if ps -p "$target_pid" > /dev/null 2>&1; then
    echo "⚠️  Could not terminate process $target_pid (permission denied or protected). Try running: sudo kill -9 $target_pid"
  else
    rm -f "$PID_FILE"
    echo "✅ Server on port $PORT has been stopped."
  fi
}

status_server() {
  local p_pid=$(get_port_pid)
  if [ -n "$p_pid" ]; then
    echo "🟢 Server is RUNNING on http://localhost:$PORT (PID: $p_pid)"
  else
    echo "🔴 Server is STOPPED on port $PORT."
  fi
}

case "$1" in
  start)
    start_server
    ;;
  stop)
    stop_server
    ;;
  restart)
    stop_server
    sleep 1
    start_server
    ;;
  status)
    status_server
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status} [PORT]"
    echo "Example:"
    echo "  $0 start         # Starts on default port 3000"
    echo "  $0 start 8080    # Starts on custom port 8080"
    echo "  $0 stop          # Stops default port 3000"
    echo "  $0 status        # Checks status"
    exit 1
    ;;
esac
