"use client"
import {useState} from "react";
import crypto from "crypto";
export default function Home() {
    const [server_seed, setServer_seed] = useState("");
    const [amount, setAmount] = useState(10);
    const chain = [server_seed];

    for (let i = 0; i < amount; i++) {
        chain.push(
            crypto
                .createHash("sha256")
                .update(chain[chain.length - 1])
                .digest("hex")
        );
    }

    const clientSeed =
        "00000000000000000004172a4be28d9cdf7e5e36836f1fc6a106ae73266bf47a";

    return (
        <div className="App">
            <h3>Enter the server seed of your game</h3>
            <input
                value={server_seed}
                onChange={e => setServer_seed(e.target.value)}
            />
            <br/>
            <br/>
            <h3>Enter the # of games to view before this one</h3>
            <input
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
            />

            <hr/>
            <h1>Crash points:</h1>

            {!( !server_seed || server_seed.length !== 64 ) ? (
                <h3 style={{color: "red"}}>
                    Please enter a server seed to view this table
                </h3>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th>Crash point</th>
                        <th>Seed</th>
                        <th>Hash (hmac with client seed)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {chain.map((seed, index) => {
                        function getPointAndHash() {
                            const hash = crypto
                                .createHmac("sha256", seed)
                                .update(clientSeed)
                                .digest("hex");
                            const divisible = (hash: string, mod: number) => {
                                const val = parseInt(hash.slice(0, 13), 16) % mod
                                return val === 0;
                            };

                            function getPoint(hash: string) {
                                if (divisible(hash, 20)) return 1.00;
                                let h = parseInt(hash.slice(0, 13), 16);
                                let e = Math.pow(2, 52);
                                const point = (33 * e - h) / (33 * (e - h))
                                if (point >= 10000) return 10000
                                return point.toFixed(2);
                            }

                            const point = getPoint(hash);
                            return {hash, point};
                        }

                        const {hash, point} = getPointAndHash();
                        return (
                            <tr key={index}>
                                <td style={{color: Number(point) < 2 ? "red" : "green"}}>
                                    {point}
                                </td>
                                <td>{seed}</td>
                                <td>{hash}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            )}
        </div>
    )
}
