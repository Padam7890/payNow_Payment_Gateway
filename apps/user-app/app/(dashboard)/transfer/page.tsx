
import prisma from "@repo/db/client";
import { AddMoney } from "../../../components/AddMoneyCard";
import { BalanceCard } from "../../../components/BalanceCard";
import { OnRampTransactions } from "../../../components/OnRampTransaction";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { useEffect } from "react";
import { redirect } from 'next/navigation'

async function getBalance() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/api/auth/signin?csrf=true')
      } 
      
    const balance = await prisma.balance.findFirst({
        where: {
            userId: Number(session?.user?.id)
        }
    });
    return {
        amount: balance?.amount || 0,
        locked: balance?.locked || 0
    }
}

async function getOnRampTransactions() {
    const session = await getServerSession(authOptions);
    const txns = await prisma.onRampTransaction.findMany({
        where: {
            userId: Number(session?.user?.id)
        },
        take:7,
        orderBy: {
            startTime: "desc"
        },
    });
    return txns.map(t => ({
        time: t.startTime,
        amount: t.amount,
        status: t.status,
        provider: t.provider
    }))
}

export default async function() {
    const balance = await getBalance();
    let transactions = await getOnRampTransactions();
 
    return <div className="w-[100%]">
        <div className="ml-5">
        <div className="text-2xl pt-8  font-bold">
            Transfer
        </div>
        <div>
            <p className="text-sm">You can load balance from Bank </p>
        </div>
        </div>
      
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
            <div>
                <AddMoney />
            </div>
            <div>
                <BalanceCard amount={balance.amount} locked={balance.locked} />
                <div className="pt-4">
                    <OnRampTransactions transactions={transactions} />
                </div>
            </div>
        </div>
    </div>
}