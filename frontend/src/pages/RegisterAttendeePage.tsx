import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { apiPost, signupAttendee } from "../utils/ClientApi";
import { setAuthRole, setAuthToken } from "../utils/authToken";


export default function RegisterAttendeePage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        preferences: "",
        bio: "",
        avatarUrl: ""
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const update = (key: string, value: string) => {
        setForm((prev) => ({...prev, [key]: value}));
    }


    async function handleSubmit(e:React.FormEvent) {
        e.preventDefault();
        setError(null);
    
        try{ 
            setLoading(true);
            const res = await signupAttendee(form);

            if (!(res as any).success){
                throw new Error((res as any).message);
            }

            setAuthToken((res as any).token);
            setAuthRole((res as any).user.role);

            navigate("/")
    }catch(err:any){
        setError(err.message ?? "Signup failed");
    } finally{
        setLoading(false);
    }

    };


    return (
        <Layout>
            <div className="max-w-md mx-auto bg-white border rounded-xl p-6 shadow-sm">
                <h1 className="text-2xl font-semibold mb-4">Register as Attendee</h1>
                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {["name", "email", "password"].map((field) => (
                                <div key={field}>
                                <label className="block text-sm text-slate-700 mb-1">
                                    {field.charAt(0).toUpperCase() + field.slice(1)}
                                </label>
                                <input
                                    type={field === "password" ? "password" : "text"}
                                    className="w-full border rounded-md px-3 py-2"
                                    value={(form as any)[field]}
                                    onChange={(e) => update(field, e.target.value)}
                                />
                                </div>
                            ))}

                                <div>
                                    <label className="block text-sm mb-1">Preferences (optional)</label>
                                    <input
                                    className="w-full border rounded-md px-3 py-2"
                                    value={form.preferences}
                                    onChange={(e) => update("preferences", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Bio (optional)</label>
                                    <textarea
                                    className="w-full border rounded-md px-3 py-2"
                                    value={form.bio}
                                    onChange={(e) => update("bio", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Avatar URL (optional)</label>
                                    <input
                                    className="w-full border rounded-md px-3 py-2"
                                    value={form.avatarUrl}
                                    onChange={(e) => update("avatarUrl", e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700"
                                >
                                    {loading ? "Registering..." : "Register"}
                                </button>

                        </form>

                        <p className="mt-4 text-sm text-slate-600">
                            Already have an account?{" "}
                            <Link className="text-blue-600" to="/login">
                                Login
                            </Link>
                        </p>
  
            </div>
        </Layout>
    )

}