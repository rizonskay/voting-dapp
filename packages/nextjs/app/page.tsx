"use client";
import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [voterAddress, setVoterAddress] = useState("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  const [proposalIndex, setProposalIndex] = useState("1");
  const [statusMsg, setStatusMsg] = useState("");

  // Чтение контракта
  const { data: votingActive } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "votingActive",
  });

  const { data: winnerName } = useScaffoldReadContract({
    contractName: "Voting",
    functionName: "winnerName",
  });

  // Запись: allowVoter (только Owner)
  const { writeAsync: allowVoter, isPending: allowPending } = useScaffoldWriteContract({
    contractName: "Voting",
    functionName: "allowVoter",
    args: [voterAddress as `0x${string}`],
    onBlockConfirmation: (txnReceipt) => {
      setStatusMsg("✅ Транзакция успешна!");
      setTimeout(() => setStatusMsg(""), 5000);
    },
  });

  // Запись: vote
  const { writeAsync: vote, isPending: votePending } = useScaffoldWriteContract({
    contractName: "Voting",
    functionName: "vote",
    args: [parseInt(proposalIndex || "0")],
    onBlockConfirmation: (txnReceipt) => {
      setStatusMsg("✅ Голос учтён!");
      setTimeout(() => setStatusMsg(""), 5000);
    },
  });

  const shortenAddress = (addr?: string) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
  };

  const isOwner = address?.toLowerCase() === "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            🗳️ Voting dApp
          </h1>
          <p className="text-xl text-white/80 font-semibold">Полная децентрализованная система голосования</p>
        </div>

        {/* Статус кошелька */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl mb-12 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-white font-bold text-2xl mb-4">💼 Статус кошелька</p>
              {isConnected ? (
                <div className="flex items-center gap-4">
                  <span className="text-white text-2xl font-mono bg-black/30 px-4 py-2 rounded-xl">
                    {shortenAddress(address)}
                  </span>
                  <span className="text-green-400 text-xl font-bold">✅ Подключён</span>
                  <button 
                    onClick={() => disconnect()} 
                    className="btn btn-sm bg-red-500/80 hover:bg-red-600 text-white border-none"
                  >
                    ❌ Отключить
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => connect({ connector: connectors[0] })} 
                  className="btn btn-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold text-xl px-8 py-3 rounded-2xl shadow-2xl"
                >
                  🔗 Подключить MetaMask
                </button>
              )}
            </div>
            <div className="text-2xl font-bold text-white/80">💰 ETH: 10,000</div>
          </div>
        </div>

        {/* Основная информация */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/5 backdrop-blur-xl border border-emerald-500/30 p-8 rounded-3xl shadow-2xl">
            <h2 className="text-3xl font-black text-emerald-400 mb-6 flex items-center gap-3">
              📋 Статус голосования
            </h2>
            <div className="text-5xl font-black mb-6">
              {votingActive === true ? (
                <span className="text-emerald-400 bg-emerald-500/20 px-8 py-4 rounded-2xl">✅ АКТИВНО</span>
              ) : (
                <span className="text-red-400 bg-red-500/20 px-8 py-4 rounded-2xl">❌ Закрыто</span>
              )}
            </div>
            <p className="text-emerald-300 font-mono text-lg">0x5FbDB2...80aa3</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-amber-500/30 p-8 rounded-3xl shadow-2xl">
            <h2 className="text-3xl font-black text-amber-400 mb-6 flex items-center gap-3">
              🏆 Победитель
            </h2>
            <div className="text-5xl font-black text-white mb-4">
              "{winnerName?.toString() || "—"}"
            </div>
            <div className="w-full bg-white/10 rounded-2xl h-4">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-4 rounded-2xl w-3/4"></div>
            </div>
          </div>
        </div>

        {/* Owner Панель */}
        {isOwner && (
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-4 border-orange-400/50 backdrop-blur-xl p-10 rounded-3xl mb-12 shadow-2xl">
            <h2 className="text-4xl font-black text-orange-300 mb-8 text-center flex items-center justify-center gap-4">
              👑 Owner Панель
            </h2>
            <div className="flex flex-col lg:flex-row gap-6">
              <input
                value={voterAddress}
                onChange={(e) => setVoterAddress(e.target.value)}
                placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                className="input input-bordered input-lg flex-1 bg-white/20 text-white placeholder-white/60 border-orange-400/50 focus:border-orange-400"
              />
              <button
                className="btn btn-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-xl px-12 border-none shadow-2xl"
                onClick={() => allowVoter?.()}
                disabled={!voterAddress || allowPending}
              >
                {allowPending ? "⏳ Подтверждение..." : "✅ Разрешить избирателю"}
              </button>
            </div>
          </div>
        )}

        {/* Панель голосования */}
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-4 border-indigo-400/50 backdrop-blur-xl p-10 rounded-3xl shadow-2xl">
          <h2 className="text-4xl font-black text-indigo-300 mb-8 text-center flex items-center justify-center gap-4">
            🗳️ Панель голосования
          </h2>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-white font-bold text-xl mb-4">Выберите предложение:</label>
              <select 
                value={proposalIndex}
                onChange={(e) => setProposalIndex(e.target.value)}
                className="select select-lg w-full bg-white/20 text-white placeholder-white/60 border-indigo-400/50 focus:border-indigo-400 text-xl"
              >
                <option value="0">Предложение 0 (Alice)</option>
                <option value="1">Предложение 1 (Bob)</option>
                <option value="2">Предложение 2 (Charlie)</option>
              </select>
            </div>
            <button
              className="btn btn-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-black text-xl px-16 border-none shadow-2xl min-w-[200px]"
              onClick={() => vote?.()}
              disabled={!proposalIndex || !isConnected || votePending}
            >
              {votePending ? "⏳ Голосование..." : "🗳️ Проголосовать"}
            </button>
          </div>
        </div>

        {/* Уведомления */}
        {statusMsg && (
          <div className="fixed top-6 right-6 z-50">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-12 py-8 rounded-3xl shadow-2xl font-black text-2xl flex items-center gap-4 animate-bounce">
              {statusMsg}
            </div>
          </div>
        )}

        {/* Информация */}
        <div className="mt-20 p-8 bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl text-center">
          <h3 className="text-2xl font-bold text-white mb-4">🎯 Техническая информация</h3>
          <div className="grid md:grid-cols-3 gap-8 text-lg">
            <div>
              <p className="text-blue-300 font-mono">Контракт:</p>
              <p className="font-bold">0x5FbDB2315678afecb367f032d93F642f64180aa3</p>
            </div>
            <div>
              <p className="text-emerald-300">Owner:</p>
              <p className="font-mono">0xf39Fd6...22</p>
            </div>
            <div>
              <p className="text-purple-300">Voter:</p>
              <p className="font-mono">0x70997...9C8</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
