import {useState} from "react";
import { useNavigate, Link } from "react-router";
import Layout from "../components/Layout";
import { apiPost } from "../utils/ClientApi";
import { setAuthToken, setAuthRole } from "../utils/authToken";

export default function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState(""); //[] because returns [value,setter]
    const [password, setPassword] = useState("");

    const [error,setError] = useState<string | null>(null); //error: string | null = null and function setError(value: string | null)
    const [loading, setLoading] = useState(false); //not loading unless explicitly start a fetch

    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        setError(null);

        if (!email || !password){
            setError("All fields are required");
            return;
        }

        try {
            setLoading(true);

            const res = await apiPost("/auth/login", {email,password});
            const token = res.token;
            const role = res.user.role;

            setAuthRole(role);
            setAuthToken(token);

                    

            if (role === "organizer") {
            navigate("/organizer");
            } else if (role === "attendee") {
            navigate("/events/all-events");
            } else if (role == "admin"){
                navigate("/admin")
            } 
            
            else {
            navigate("/");
            }

        }catch(err: any){
            console.error(err);
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    } 

    return (
        <Layout>
            <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">Log in</h1>
                {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-700 mb-1">Email</label>
                        <input
                                type="email"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                />
                                
                    </div>
                        <label className="block text-sm text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white rounded-md py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                 <p className="mt-4 text-sm text-slate-600">
                    Don’t have an account?{" "}
                    <Link to="/register" className="text-blue-600 hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </Layout>
    )
      }




