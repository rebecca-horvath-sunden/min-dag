import "./CreateProfileModal.css";
import { useState } from "react";
import type { FormEvent } from "react";

interface CreateProfileModalProps {
  onCreateProfile: (name: string, avatar: string) => void;
  onCancel: () => void;
}

const avatarSuggestions = ["👧", "👦", "🧒", "🐱", "🐶", "🦊"];

function CreateProfileModal({
  onCreateProfile,
  onCancel,
}: CreateProfileModalProps) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🧒");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    onCreateProfile(trimmedName, avatar);
    setName("");
    setAvatar("🧒");
  };

  return (
    <form className="create-profile-form" onSubmit={handleSubmit}>
      <h2>Skapa profil</h2>

      <label htmlFor="profile-name">Vad heter du?</label>
      <input
        id="profile-name"
        className="profile-name-input"
        type="text"
        placeholder="Skriv ditt namn..."
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />

      <fieldset className="avatar-fieldset">
        <legend>Välj en avatar</legend>

        <div className="avatar-options">
          {avatarSuggestions.map((suggestion) => (
            <button
              className={`avatar-option ${
                avatar === suggestion ? "avatar-option--active" : ""
              }`}
              key={suggestion}
              type="button"
              onClick={() => setAvatar(suggestion)}
              aria-pressed={avatar === suggestion}
              aria-label={`Välj avatar ${suggestion}`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="profile-form-actions">
        <button className="profile-submit-button" type="submit">
          Skapa profil
        </button>
        <button
          className="profile-cancel-button"
          type="button"
          onClick={onCancel}
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}

export default CreateProfileModal;
