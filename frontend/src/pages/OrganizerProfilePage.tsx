import { useEffect, useState } from "react";
import OrganizerLayout from "../components/OrganizerLayout";
import { apiGet, apiPatch } from "../utils/ClientApi";
import { getAuthRole } from "../utils/authToken";
import type {
  OrganizerCoreUser,
  OrganizerProfile,
  OrganizerProfileUpdateRequest,
} from "../types/profile";
import type { Event } from "../types/event";
import { useNavigate } from "react-router-dom";

export default function OrganizerProfilePage() {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState<OrganizerCoreUser | null>(null);


  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Inline editing
  const [isEditing, setIsEditing] = useState(false);
  const [editWebsite, setEditWebsite] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);

  // ----------------------------
  // Ensure organizer only
  // ----------------------------
  useEffect(() => {
    if (getAuthRole() !== "organizer") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // ----------------------------
  // Load profile + events
  // ----------------------------
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const res = await apiGet("/profile/me");
        setUserInfo({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        });



        const organizer = res.user.organizerProfile;

        if (!organizer) {
          setErrorMsg("Organizer profile not found");
          return;
        }

        setProfile(organizer);

        setEditWebsite(organizer.website ?? "");
        setEditBio(organizer.bio ?? "");

        const evRes = await apiGet("/event/company-events");
        setEvents(evRes.events || []);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // ----------------------------
  // Save updated profile
  // ----------------------------
  async function handleSave() {
    setSaving(true);
    setErrorMsg("");

    const payload: OrganizerProfileUpdateRequest = {
      website: editWebsite || null,
      bio: editBio || null,
    };

    try {
      const res = await apiPatch("/profile/organizer/update", payload);
      setProfile(res.profile);
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <OrganizerLayout>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <p className="text-sm text-[#697177]">Loading profile...</p>
        </div>
      </OrganizerLayout>
    );
  }

  if (!profile) {
    return (
      <OrganizerLayout>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <p className="text-sm text-red-600">
            {errorMsg || "Profile not found"}
          </p>
        </div>
      </OrganizerLayout>
    );
  }


  return (
    <OrganizerLayout>
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        <h1 className="text-2xl font-semibold text-[#11181C]">Organizer Profile</h1>

        {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}


        <section className="bg-white border border-[#E2E8EF] rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <p className="text-sm text-[#697177]">Name</p>
            <p className="text-base font-medium text-[#11181C]">
              {userInfo?.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-[#697177]">Email</p>
            <p className="text-base font-medium text-[#11181C]">
              {userInfo?.email}
            </p>
          </div>

     
          <div>
            <p className="text-sm text-[#697177] mb-1">Website</p>

            {!isEditing ? (
              <p className="text-base text-[#11181C]">
                {profile.website || (
                  <span className="text-[#8B959E]">Not provided</span>
                )}
              </p>
            ) : (
              <input
                type="text"
                value={editWebsite}
                onChange={(e) => setEditWebsite(e.target.value)}
                className="w-full border border-[#E2E8EF] rounded-md px-3 py-2 text-sm"
              />
            )}
          </div>

          <div>
            <p className="text-sm text-[#697177] mb-1">Bio</p>

            {!isEditing ? (
              <p className="text-base text-[#11181C] whitespace-pre-wrap">
                {profile.bio || (
                  <span className="text-[#8B959E]">No bio added</span>
                )}
              </p>
            ) : (
              <textarea
                rows={4}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full border border-[#E2E8EF] rounded-md px-3 py-2 text-sm"
              />
            )}
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm px-3 py-1 rounded-md border border-[#E2E8EF] 
                         text-[#11181C] hover:bg-[#F3F4F6]"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-sm px-4 py-1 rounded-md bg-[#11181C] 
                           text-white hover:bg-black"
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="text-sm px-4 py-1 rounded-md border border-[#E2E8EF] 
                           text-[#11181C] hover:bg-[#F3F4F6]"
              >
                Cancel
              </button>
            </div>
          )}
        </section>


        <section className="bg-white border border-[#E2E8EF] rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#11181C] mb-4">
            Statistics
          </h2>

          <p className="text-sm text-[#11181C]">
            <span className="font-medium">{events.length}</span> event(s) created
          </p>
        </section>
      </div>
    </OrganizerLayout>
  );
}
