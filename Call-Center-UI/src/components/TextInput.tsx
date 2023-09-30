const TextInput = ({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
    <div className="w-1/2">
        <p className="font-bold">{label}</p>
        <input
            type="text"
            className="border-2 border-gray-400 rounded-md p-2 w-11/12"
            value={value}
            onChange={onChange}
        />
    </div>
);

export default TextInput;
