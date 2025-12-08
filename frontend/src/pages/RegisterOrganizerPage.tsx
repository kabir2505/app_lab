import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupOrganizer } from "../utils/ClientApi";
import { setAuthRole, setAuthToken } from "../utils/authToken";
import Layout from "../components/Layout";


export default function RegisterOrganizerPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState(
        {
            name: "",
            email: "",
            password: "",
            organizationName: "",
            website: "",
            bio: ""
        }
    );


    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const update = (key: string, value:string) => {
        setForm((prev) => ({...prev, [key]:value}))
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        try {
            setLoading(true);
            const res = await signupOrganizer(form);

            if (!(res as any).success) throw new Error((res as any).message);

            setAuthToken((res as any).token);
            setAuthRole((res as any).user.role);

            navigate("/");
        } catch (err:any) {
            setError(err.message ?? "Signup failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Layout>
      <div className="max-w-md mx-auto bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-4">Register as Organizer</h1>

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
            <label className="block text-sm mb-1">Organization Name</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={form.organizationName}
              onChange={(e) => update("organizationName", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Website</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
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
  );
}