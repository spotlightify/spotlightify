interface Props {
  value: string;
  onChange: (event: { target: { value: any } }) => void;
}

function Prompt({ value, onChange }: Props) {
  return (
    <input
      className="input-prompt"
      onChange={onChange}
      value={value}
      placeholder="Spotlightify Search"
    />
  );
}

export default Prompt;
