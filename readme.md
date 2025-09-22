# Guarani Bridge 🌉

Un puente de tokens descentralizado que permite transferir **GuaraniTokens** entre dos cadenas de bloques (L1 ↔ L2) de forma segura y eficiente. Implementa el patrón **lock-and-mint** con protección contra replay attacks y verificación criptográfica.

## ✨ Características Principales

- 🔒 **Lock-and-Mint Pattern**: Los tokens se bloquean en L1 y se acuñan equivalentes en L2
- 🛡️ **Replay Protection**: Previene el procesamiento duplicado de transacciones
- 🤖 **Relayer Automatizado**: Escucha eventos y ejecuta transferencias automáticamente
- 🔍 **Transparencia Total**: Todos los eventos son auditables en ambas cadenas
- 🎯 **Gas Optimizado**: Contratos eficientes con mínimo consumo de gas
- 🧪 **Entorno de Testing**: Configuración completa para desarrollo local

## 🌉 Cómo Funciona

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GUARANI BRIDGE FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

    L1 (Hardhat - Puerto 31337)              L2 (Anvil - Puerto 1338)
    ┌─────────────────────────┐              ┌─────────────────────────┐
    │                         │              │                         │
    │  👤 Usuario             │              │  👤 Usuario (mismo)     │
    │  📦 GuaraniToken        │              │  📦 GuaraniToken        │
    │  🔒 Sender Contract     │              │  🏭 Receiver Contract   │
    │                         │              │                         │
    └─────────────────────────┘              └─────────────────────────┘
              │                                        ▲
              │ 1. lock(amount) 🔒                     │
              │    - Tokens bloqueados                 │
              │    - Emite evento "Locked"             │ 3. mintRemote() 🏭
              │                                        │    - Crea tokens en L2
              │                                        │    - Emite evento "Minted"
              └──────────────────┐                     │
                                 │                     │
                                 ▼                     │
                        ┌─────────────────────┐        │
                        │   🤖 RELAYER        │────────┘
                        │                     │
                        │ 2. Escucha "Locked" │
                        │    Ejecuta mint     │
                        │    en L2            │
                        └─────────────────────┘

Flujo Detallado:
1️⃣ **Preparación**: Usuario aprueba tokens al contrato Sender en L1
2️⃣ **Lock**: Usuario llama lock(recipientL2, amount) → tokens se bloquean
3️⃣ **Evento**: Se emite evento "Locked" con ID único y detalles
4️⃣ **Relayer**: Detecta evento y valida la transacción
5️⃣ **Mint**: Relayer ejecuta mintRemote() en contrato Receiver de L2
6️⃣ **Confirmación**: Se acuñan tokens equivalentes para el destinatario
```

## 🔧 Componentes Técnicos

### Contratos Inteligentes

- **`GuaraniToken.sol`**: Token ERC20 con funcionalidad de mint/burn y roles
- **`Sender.sol`**: Contrato en L1 que bloquea tokens y emite eventos
- **`Receiver.sol`**: Contrato en L2 que acuña tokens tras verificación
- **`Verifier.sol`**: (Opcional) Verificación criptográfica adicional

### Infraestructura

- **Relayer**: Servicio Node.js que monitorea eventos y ejecuta transferencias
- **Frontend**: Interfaz web para interactuar con el puente
- **Testing**: Suite completa de tests para validar funcionalidad

## 🛡️ Seguridad

- **Nonce System**: Cada transferencia tiene un ID único incremental
- **Replay Protection**: Mapping de transacciones procesadas previene duplicados
- **Role-Based Access**: Solo el relayer autorizado puede acuñar tokens
- **Event Validation**: Verificación completa de eventos antes del procesamiento

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js v18+
- npm o yarn
- MetaMask u otro wallet compatible

### 1️⃣ Instalar dependencias

```bash
npm install
```

### 2️⃣ Arrancar cadenas locales

Necesitas **dos terminales** para ejecutar ambas cadenas:

```bash
# Terminal 1 - L1 (Hardhat)
npm run node:n1   # Puerto 31337

# Terminal 2 - L2 (Anvil)
npm run node:n2   # Puerto 1338
```

### 3️⃣ Compilar y desplegar contratos

```bash
npm run compile      # Compila todos los contratos
npm run deploy:n1    # Despliega en L1 (Hardhat)
npm run deploy:n2    # Despliega en L2 (Anvil)
```

Los archivos `deploy-N1.json` y `deploy-N2.json` contendrán las direcciones de los contratos desplegados.

### 4️⃣ Configurar Frontend (Opcional)

Edita las direcciones de los contratos en `public/index.html` y lanza el servidor:

```bash
npm run frontend     # Abre http://localhost:3000
```

### 5️⃣ Iniciar Relayer

```bash
npm run relayer      # Inicia el servicio de relaying
```

## 💡 Uso

### Via Frontend Web

1. Conecta MetaMask a la red L1 (puerto 31337)
2. Ingresa la dirección de destino en L2
3. Especifica la cantidad de tokens a transferir
4. Haz clic en "BRIDGE →"
5. El relayer procesará automáticamente la transferencia

### Via Scripts

```bash
# Mintear tokens iniciales
npm run script scripts/mintTokens.js

# Aprobar tokens al contrato Sender
npm run script scripts/approveTokens.js

# Bloquear tokens en L1
npm run script scripts/lockTokens.js

# Verificar balances
npm run script scripts/checkBalance.js
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests específicos
npm run test:bridge           # Tests del puente
npm run test:infrastructure   # Tests de infraestructura
npm run test:diagnostics      # Diagnósticos de red
```

## 📁 Estructura del Proyecto

```
guarani-bridge/
├── contracts/           # Contratos Solidity
├── scripts/            # Scripts de deployment y utilidades
├── test/              # Suite de tests
├── relayer/           # Servicio relayer
├── public/            # Frontend web
├── utils/             # Utilidades compartidas
└── artifacts/         # Contratos compilados
```
