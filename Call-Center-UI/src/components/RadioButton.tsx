const RadioButton = ({
    label,
    value,
    checked,
    onChange,
}: {
    label: string;
    value: string;
    checked: boolean;
    onChange: () => void;
}) => (
    <div>
        <input
            type="radio"
            name="taxiType"
            value={value}
            checked={checked}
            onChange={onChange}
            className="border-2 border-gray-400 rounded-md p-2 w-[16px] h-[16px]"
        />
        <label htmlFor={value} className="ml-2">
            {label}
        </label>
    </div>
);

export default RadioButton;
