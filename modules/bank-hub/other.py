
import json
import requests
from datetime import datetime, timedelta

CLIENT_ID = "b445039f-d25f-476e-a9ea-83302b377024"
CLIENT_SECRET = "de1a0c26-70d6-4353-b2a9-473f03c42b7d"
BASE_URL = "https://api.pluggy.ai"

api_key = None
api_key_created_at = None
isExpired = False

def set_api_key(key):
    global api_key, api_key_created_at, isExpired
    api_key = key
    api_key_created_at = datetime.now()
    isExpired = False

def check_api_key_expired():
    global isExpired
    if api_key_created_at is None:
        isExpired = True
    else:
        isExpired = datetime.now() > api_key_created_at + timedelta(hours=2)
    return isExpired

def get_api_key():
    headers = {
        "accept": "application/json",
        "content-type": "application/json"
    }

    payload = {
        "clientId": CLIENT_ID,
        "clientSecret": CLIENT_SECRET
    }

    response = requests.post(f"{BASE_URL}/auth", headers=headers, json=payload)
    set_api_key(response.json().get("apiKey"))

bank_account = {
    "id": "",
    "type": "",
    "name": "",
    "balance": 0,
    "currencyCode": "",
    "owner": "",
    "bankData": {
        "transferNumber": "",
        "closingBalance": 0,
        "automaticallyInvestedBalance": 0,
        "overdraftContractedLimit": 0,
        "overdraftUsedLimit": 0,
        "unarrangedOverdraftAmount": 0
    }
}

bank_item = {
    "id": "",
    "products": [],
    "status": "",
    "executionStatus": "",
    "createdAt": ""
}

bank = {
    "id": "",
    "name": "",
    "status": "",
    "item": [bank_item],
    "bank_accounts": [bank_account],
    "transactions": []
}

banks = []

def list_connector():
    if check_api_key_expired():
        get_api_key()

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "X-API-KEY": api_key
    }
    response = requests.get(f"{BASE_URL}/connectors", headers=headers)
    
    connectors = response.json().get("results", [])
    for connector in connectors:
        if connector.get('name') in ['Nubank', 'Inter', 'PicPay', 'Itaú', 'Neon']:
            bank = {
                "id": connector.get("id"),
                "name": connector.get("name"),
                "status": connector.get("health").get("status"),
                "item": {
                    "id": ""
                }
            }
            if connector.get("name") == "Nubank":
                bank["item"] = {
                    "id": "0553c99a-9462-4200-bb69-d28aa70f79d8"
                }
            banks.append(bank)
        else:
            pass

def retrieve_item(bank):
    if check_api_key_expired():
        get_api_key()

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "X-API-KEY": api_key
    }

    if bank['item']['id']:
        response = requests.get(f"{BASE_URL}/items/{bank['item']['id']}", headers=headers).json()
        keys = [
            'products', 'status', 'executionStatus', 'createdAt'
        ]
        for key in keys:
            bank['item'][key] = response.get(key)

def list_account(bank):
    if check_api_key_expired():
        get_api_key()

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "X-API-KEY": api_key
    }

    if bank['item']['id']:
        response = requests.get(f"{BASE_URL}/accounts?itemId={bank['item']['id']}", headers=headers).json()
        
        if response.get('total') > 0:
            if response.get('results'):
                response = response.get('results')

                if 'bank_accounts' not in bank or not isinstance(bank['bank_accounts'], list):
                    bank['bank_accounts'] = []
                for result in response:
                    account = {
                        "id": result.get("id"),
                        "type": result.get("type"),
                        "name": result.get("name"),
                        "balance": result.get("balance"),
                        "currencyCode": result.get("currencyCode"),
                        "owner": result.get("owner"),
                        "bankData": {
                            "transferNumber": "",
                            "closingBalance": 0,
                            "automaticallyInvestedBalance": 0,
                            "overdraftContractedLimit": 0,
                            "overdraftUsedLimit": 0,
                            "unarrangedOverdraftAmount": 0
                        }
                    }
                    if result.get("bankData"):
                        account['bankData']['transferNumber'] = result.get("bankData").get("transferNumber")
                        account['bankData']['closingBalance'] = result.get("bankData").get("closingBalance")
                        account['bankData']['automaticallyInvestedBalance'] = result.get("bankData").get("automaticallyInvestedBalance")
                        account['bankData']['overdraftContractedLimit'] = result.get("bankData").get("overdraftContractedLimit")
                        account['bankData']['overdraftUsedLimit'] = result.get("bankData").get("overdraftUsedLimit")
                        account['bankData']['unarrangedOverdraftAmount'] = result.get("bankData").get("unarrangedOverdraftAmount")
                    
                    bank['bank_accounts'].append(account)

def list_transaction_all(bank):
    if check_api_key_expired():
        get_api_key()

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "X-API-KEY": api_key
    }
    
    response = requests.get(
        f"{BASE_URL}/transactions?accountId={bank['bank_accounts'][0]['id']}&pageSize=500", 
        headers=headers
    ).json()
     
    if response.get('total') > 0:
        bank['transactions'] = response.get('results', [])

def list_transaction_by_date(bank, from_date, to_date):
    if check_api_key_expired():
        get_api_key()

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "X-API-KEY": api_key
    }

    response = requests.get(f"{BASE_URL}/transactions?accountId={bank['id']}&from={from_date}&to={to_date}&pageSize=500", headers=headers).json()
    if response.get('total') > 0:
        bank['transactions'] = response.get('results', [])

def retrieve_transaction(transaction_id):
    if check_api_key_expired():
        get_api_key()
        
    headers = {
        "accept": "application/json",
        "X-API-KEY": api_key
    }

    response = requests.get(f"{BASE_URL}transactions/{transaction_id}", headers=headers).json()
    print(response)

def main():
    get_api_key()
    list_connector()
    for bank in banks:
        if bank['item']['id'] != '':
            retrieve_item(bank)
            list_account(bank)
            print("bank:", bank)
            list_transaction_all(bank)
    print("banks:", banks)
    # list_connector()

# Só executa o bloco Pluggy se rodar como script, não como microserviço
if __name__ == "__main__":
    main()
    
    