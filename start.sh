#!/bin/bash

# Función para detener los procesos hijos cuando se cierra el script
cleanup() {
    echo ""
    echo "Deteniendo servidores</>"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Capturar Ctrl+C (SIGINT) para ejecutar cleanup
trap cleanup SIGINT

echo "Iniciando Robert: Proyecto CORTEX </>"
echo "---------------------------------------"

# 1. Iniciar Backend (FastAPI)
echo "Arrancando Backend (Python/FastAPI)</>"
cd backend
# Ejecutamos python en segundo plano
# Logs guardados en backend.log para depuración
python main.py > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Esperar un momento para asegurar que el backend no falle inmediatamente
sleep 4

# Verificar si el backend sigue corriendo
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Error: El backend falló al iniciar. Revisa backend/backend.log:"
    tail -n 10 backend/backend.log
    # No matamos el script, dejamos que el usuario vea el error
fi

echo "Backend activo (PID: $BACKEND_PID)</>"

# 2. Iniciar Frontend (Vite)
echo "Arrancando Frontend (React/Vite)</>..."
cd frontend
# Ejecutamos vite en segundo plano, ocultando output verboso inicial
# Guardamos log en frontend.log para depuración
npm run dev -- --host > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "Frontend activo (PID: $FRONTEND_PID)</>"

echo "---------------------------------------"
echo "--- ¡Sistemas en línea!"
echo ""
echo "> Abrir Interfaz Web:  http://localhost:5173"
echo "> API Backend:         http://localhost:8000"
echo "> Logs Backend:        backend/backend.log"
echo "> Logs Frontend:       frontend/frontend.log"
echo "Presiona Ctrl+C para detener todo."
echo "> Abrir Interfaz Web:  http://localhost:5173"
echo "> API Backend:         http://localhost:8000"
echo "> Documentación API:   http://localhost:8000/docs"
echo ""
echo "Presiona Ctrl+C para detener todo."

# Mantiene el script corriendo para que trap funcione
wait
