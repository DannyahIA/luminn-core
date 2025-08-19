# Bank Hub Microservice

Microserviço para gerenciamento de dados bancários usando arquitetura hexagonal, preparado para integração com GraphQL.

## Estrutura do Projeto

```
bank-hub/
├── src/
│   ├── domain/           # Entidades de negócio
│   │   ├── entities.py   # Modelos de domínio
│   │   └── __init__.py
│   ├── application/      # Casos de uso e regras de negócio
│   │   ├── services.py   # Serviços e interfaces
│   │   └── __init__.py
│   ├── infrastructure/   # Implementações técnicas
│   │   ├── database.py   # Configuração do banco
│   │   ├── repositories.py # Implementações dos repositórios
│   │   └── __init__.py
│   ├── adapters/         # Interfaces externas
│   │   ├── controllers.py # Controllers REST
│   │   └── __init__.py
│   └── __init__.py
├── main.py              # Aplicação FastAPI
├── requirements.txt     # Dependências
└── README.md           # Esta documentação
```

## Arquitetura Hexagonal

### Domain (Núcleo)
- **Entidades**: Modelos de negócio puros sem dependências externas
- **Regras de negócio**: Lógica que não muda independente da tecnologia

### Application (Casos de Uso)
- **Serviços**: Orquestração das regras de negócio
- **Interfaces**: Contratos para repositórios e serviços externos

### Infrastructure (Implementação)
- **Repositórios**: Implementação concreta para persistência
- **Database**: Configuração e modelos SQLAlchemy

### Adapters (Interfaces Externas)
- **Controllers**: Endpoints REST para o GraphQL consumir
- **DTOs**: Modelos Pydantic para entrada/saída

## Instalação e Execução

1. Instalar dependências:
```bash
pip install -r requirements.txt
```

2. Executar o microserviço:
```bash
uvicorn main:app --reload
```

3. Acessar documentação:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints Disponíveis

### Users
- `POST /users` - Criar usuário
- `GET /users/{user_id}` - Buscar usuário

### Banks
- `POST /banks` - Criar banco
- `GET /users/{user_id}/banks` - Listar bancos do usuário

### Accounts
- `POST /accounts` - Criar conta bancária
- `GET /banks/{bank_id}/accounts` - Listar contas do banco

### Transactions
- `POST /transactions` - Criar transação
- `GET /banks/{bank_id}/transactions` - Listar transações do banco

### Health
- `GET /health` - Status do serviço

## Integração com GraphQL

Este microserviço foi projetado para ser consumido por um core GraphQL:

1. **Separação de responsabilidades**: Cada endpoint tem uma responsabilidade específica
2. **DTOs bem definidos**: Facilita o mapeamento para esquemas GraphQL
3. **Arquitetura limpa**: Permite extensões sem quebrar a estrutura
4. **Health check**: Monitoramento do estado do serviço

## Banco de Dados

Utilizando SQLite para desenvolvimento local. Para produção, pode ser facilmente alterado para PostgreSQL modificando apenas a `DATABASE_URL` em `src/infrastructure/database.py`.

### Tabelas
- `users` - Dados dos usuários
- `pluggy_credentials` - Credenciais API Pluggy
- `bank` - Informações dos bancos
- `bank_account` - Contas bancárias
- `bank_data` - Dados complementares das contas
- `bank_item` - Itens/conexões bancárias
- `products` - Produtos financeiros
- `transaction` - Transações financeiras

## Próximos Passos

1. Implementar autenticação/autorização
2. Adicionar testes unitários e de integração
3. Configurar logging estruturado
4. Implementar cache (Redis)
5. Adicionar métricas e observabilidade
6. Dockerizar a aplicação
