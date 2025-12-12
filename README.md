# Voting dApp (Scaffold-ETH 2)

## Описание
Проект — простая система децентрализованного голосования на Solidity на базе Scaffold-ETH 2 (Hardhat + NextJS).
Owner запускает голосование и выдаёт право голоса адресам, после чего пользователи могут проголосовать один раз за выбранный вариант.

## Реализовано
- Смарт-контракт `Voting.sol`:
  - `startVoting(string[])` — запуск голосования и создание вариантов
  - `allowVoter(address)` — выдача права голоса (только owner)
  - `vote(uint256)` — голосование (1 раз на адрес)
  - `winner()` / `getProposal()` — чтение результатов
- Тесты Hardhat (TypeScript) для основных сценариев.

## Запуск проекта
Нужно открыть 3 терминала в корне проекта.

### 1) Локальная сеть Hardhat

yarn chain

RPC: `http://127.0.0.1:8545`, ChainId: `31337`.

### 2) Деплой контракта

yarn deploy

### 3) Запуск фронта

yarn start

Открыть: `http://localhost:3000`, страница **Debug Contracts**.

## Проверка через Debug Contracts
1) Подключить MetaMask к сети Hardhat (RPC `http://127.0.0.1:8545`, chainId `31337`).
2) Открыть контракт `Voting`.
3) От owner вызвать `allowVoter(адрес_избирателя)` (иначе будет `Only owner`).
4) Переключиться на избирателя и вызвать `vote(0/1/2)`.
5) Проверить `hasVoted(...)`, `getProposal(...)`, `winner()`.

## Тесты
Запуск тестов:

yarn hardhat:test