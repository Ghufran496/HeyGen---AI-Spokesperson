import { Input, Spinner, Tooltip } from "@nextui-org/react";
import { PaperPlaneRight } from "@phosphor-icons/react";
import clsx from "clsx";

interface SurveyAvatarTextInputProps {
  label?: string;
  placeholder?: string;
  input: string;
  onSubmit: () => void;
  setInput: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function SurveyAvatarTextInput({
  label = "Chat",
  placeholder = "Type your response here...",
  input,
  onSubmit,
  setInput,
  disabled = false,
  loading = false,
}: SurveyAvatarTextInputProps) {
  function handleSubmit() {
    if (input.trim()) {
      onSubmit();
      setInput("");
    }
  }

  return (
    <Input
      endContent={
        <Tooltip content="Send">
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <button
              type="button"
              className="focus:outline-none"
              onClick={handleSubmit}
            >
              <PaperPlaneRight
                className={clsx("text-indigo-500 hover:text-indigo-400", disabled && "opacity-50")}
                size={24}
              />
            </button>
          )}
        </Tooltip>
      }
      value={input}
      onValueChange={setInput}
      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      placeholder={placeholder}
      label={label}
      isDisabled={disabled}
    />
  );
}
