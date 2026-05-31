# Despliegue en Raspberry Pi

Guía paso a paso para (1) recuperar el acceso SSH a la Raspberry y (2) desplegar
la aplicación con Docker Compose. Pensada para una Pi con **Raspberry Pi OS**
(basado en Debian) y arquitectura ARM (32/64 bits).

---

## Parte 1 — Recuperar el acceso SSH

> Tienes acceso físico/visual a la Pi (monitor) pero no recuerdas usuario/contraseña.
> Sigue las opciones en orden; en cuanto una funcione, salta a la Parte 2.

### 1.1 Identificar el nombre de usuario

En la pantalla de la Pi, abre una terminal y observa el *prompt*: tiene el formato
`usuario@hostname`. También puedes ejecutar:

```bash
whoami      # nombre del usuario actual
hostname -I # IP(s) de la Pi en la red
```

El usuario por defecto suele ser `pi` (imágenes antiguas) o el que definiste al
flashear la tarjeta con Raspberry Pi Imager.

### 1.2 Opción A — Resetear contraseña desde la propia Pi (si tienes sesión abierta)

Si la Pi ya tiene una sesión iniciada en el escritorio/terminal:

```bash
# Cambiar la contraseña del usuario (te pedirá la actual si la sabes; si eres
# root o tienes sudo sin contraseña, no la pedirá):
passwd

# Si necesitas cambiar la de otro usuario y tienes sudo:
sudo passwd <usuario>

# Asegurar que el servicio SSH está activo y arranca al inicio:
sudo systemctl enable --now ssh
```

### 1.3 Opción B — Resetear desde la tarjeta SD (sin contraseña, desde tu PC)

Si no puedes autenticarte de ninguna forma:

1. Apaga la Pi y extrae la microSD. Insértala en tu PC con Windows.
2. Se montará la partición **`boot`** (también llamada `bootfs`), visible en el
   Explorador de Windows.
3. En esa partición `boot`:
   - **Habilitar SSH**: crea un archivo vacío llamado exactamente `ssh` (sin extensión).
     En PowerShell, desde la unidad de la SD (p. ej. `E:`):
     ```powershell
     New-Item -ItemType File -Path E:\ssh -Force
     ```
   - **Fijar usuario y contraseña**: crea un archivo `userconf.txt` con una sola
     línea `usuario:contraseña_cifrada`. La contraseña debe ir cifrada con `openssl`.
     Genera el hash (en la Pi, en otra máquina Linux/WSL, o con Git Bash):
     ```bash
     echo 'MiNuevaClave123' | openssl passwd -6 -stdin
     ```
     Copia el resultado (empieza por `$6$...`) y crea el archivo, por ejemplo:
     ```
     pi:$6$abcd...elhashcompleto...
     ```
     > Nota: si tu imagen usa `firstrun.sh`/configuración de Imager, `userconf.txt`
     > es el método oficial y soportado para (re)definir credenciales.
4. Expulsa la SD de forma segura, vuelve a insertarla en la Pi y enciéndela.

### 1.4 Conectar por SSH

Desde Windows/PowerShell, usando la IP obtenida en el paso 1.1:

```powershell
ssh <usuario>@<IP-de-la-Pi>
# Ejemplo: ssh pi@192.168.1.50
```

Si da error de clave de host conocida (tras reinstalar), elimina la entrada antigua:
```powershell
ssh-keygen -R <IP-de-la-Pi>
```

---

## Parte 2 — Preparar la Raspberry

```bash
# Actualizar el sistema
sudo apt update && sudo apt full-upgrade -y

# Comprobar arquitectura (aarch64 = 64 bits, armv7l = 32 bits)
uname -m

# Instalar Docker (script oficial, soporta ARM)
curl -fsSL https://get.docker.com | sh

# Permitir usar docker sin sudo (requiere cerrar y reabrir sesión)
sudo usermod -aG docker $USER
newgrp docker   # aplica el grupo en la sesión actual sin reloguear

# Verificar
docker --version
docker compose version

# Instalar git si no está
sudo apt install -y git
```

---

## Parte 3 — Desplegar la aplicación

```bash
# 1. Clonar el repositorio público
git clone <URL-del-repositorio> gestiontareas
cd gestiontareas

# 2. Crear el archivo .env real a partir de la plantilla
cp .env.example .env
nano .env
```

En `.env`, ajusta como mínimo:
- `POSTGRES_PASSWORD`: una contraseña fuerte.
- `DATABASE_URL`: usa el mismo usuario/clave/BD y deja el host como `db`
  (es el nombre del servicio en Docker Compose).
- `JWT_SECRET`: genera uno aleatorio:
  ```bash
  openssl rand -hex 48
  ```
- `CORS_ORIGIN`: la URL desde la que abrirás el frontend, p. ej.
  `http://192.168.1.50:8080` (IP de la Pi y `WEB_PORT`).

```bash
# 3. Construir y levantar (db + api + web)
docker compose up -d --build

# 4. Comprobar estado
docker compose ps
docker compose logs -f api   # ver que migró y arrancó (Ctrl+C para salir)

# 5. (Opcional) cargar datos demo
docker compose exec api npx prisma db seed
```

> Las migraciones se aplican solas al arrancar el contenedor `api`
> (`prisma migrate deploy` en el `CMD` del Dockerfile).

### Acceso

- Frontend: `http://<IP-de-la-Pi>:8080`
- Healthcheck API: `http://<IP-de-la-Pi>:8080/api/health`

### Comandos útiles

```bash
docker compose down           # detener (mantiene el volumen de datos)
docker compose down -v        # detener y BORRAR la base de datos
docker compose pull && docker compose up -d --build   # actualizar
```

---

## Parte 4 — Endurecimiento opcional

```bash
# Firewall: permitir solo SSH y el puerto web
sudo apt install -y ufw
sudo ufw allow 22/tcp
sudo ufw allow 8080/tcp
sudo ufw enable
```

Los contenedores ya usan `restart: unless-stopped`, por lo que la app vuelve a
levantarse automáticamente tras un reinicio de la Pi.
