import "./ProfileSelector.css";
import type { Profile } from "../../types";

// Define the props for selecting, creating, and deleting profiles.
interface ProfileSelectorProps {
  profiles: Profile[];
  onSelectProfile: (profileId: number) => void;
  onCreateProfile: () => void;
  onDeleteProfile: (profileId: number) => void;
  activeProfileId: number | null;
}

// Display the profiles and allow the user to select, create, or delete a profile.
function ProfileSelector({
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
}: ProfileSelectorProps) {
  return (
    <section className="profile-selector">
      <h2>Välj profil</h2>

      <div className="profile-list">
        {profiles.map((profile) => (
          <div className="profile-item" key={profile.id}>
            <button
              className={`profile-select-button ${
                activeProfileId === profile.id
                  ? "profile-select-button--active"
                  : ""
              }`}
              type="button"
              onClick={() => onSelectProfile(profile.id)}
              aria-pressed={activeProfileId === profile.id}
            >
              {profile.avatar} {profile.name}
            </button>

            <button
              className="profile-delete-button"
              type="button"
              onClick={() => onDeleteProfile(profile.id)}
              aria-label={`Ta bort profilen ${profile.name}`}
              title={`Ta bort ${profile.name}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        className="profile-create-button"
        type="button"
        onClick={onCreateProfile}
      >
        + Skapa profil
      </button>
    </section>
  );
}

export default ProfileSelector;
