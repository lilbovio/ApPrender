import { useState } from "react";

const ChangePassword = () => {
  const [password, setPassword] = useState("");

  return (
    <div>
      <h2>Cambiar contraseña</h2>

      <input
        type="password"
        placeholder="Nueva contraseña"
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>
  );
};

export default ChangePassword;