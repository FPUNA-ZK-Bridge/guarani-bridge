# Guarani Bridge

## Instalación y Configuración

### 1) Instalar dependencias

```bash
npm install
```

### 2) Arrancar cadenas locales (dos terminales)

```bash
npm run node:n1 # Hardhat 31337
npm run node:n2 # Anvil 1338
```

### 3) Compilar y desplegar

```bash
npm run compile
npm run deploy:n1
npm run deploy:n2
```

### 4) (Opcional) edita public/index.html con las direcciones del deploy

y lanza servidor estático

```bash
npm run frontend # abre http://localhost:3000
```

### 5) Relayer

```bash
npm run relayer
```
