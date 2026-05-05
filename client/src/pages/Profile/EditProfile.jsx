import { useState } from "react";

const EditProfile = () => {
  const [name, setName] = useState("");

  return (
    <div>
      <h2>Editar Perfil</h2>

      <input
        placeholder="Nombre de usuario"
        onChange={(e) => setName(e.target.value)}
      />
    </div>
  );
};

export default EditProfile;