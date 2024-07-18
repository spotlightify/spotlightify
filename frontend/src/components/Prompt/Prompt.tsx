interface Props {
  value: string;
  placeHolder: string;
  onChange: (event: { target: { value: any } }) => void;
}

function Prompt({ value, onChange, placeHolder }: Props) {
  return (
    <input
      className="input-prompt"
      onChange={onChange}
      value={value}
      placeholder={placeHolder}
      autoFocus
    />
  );
}

export default Prompt;
