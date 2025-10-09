import { useNavigate } from "react-router-dom";
import { EditorLayout } from "../components/EditorLayout";

export default function Editor() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return <EditorLayout onBack={handleBack} />;
}
