const Dropdown = ({
    label,
    value,
    data,
    onChange,
}: {
    label: string;
    value: string;
    data: string[];
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}) => (
    <div className="w-1/2">
        <p className="font-bold">{label}</p>

        <select
            className="border-2 border-gray-400 rounded-md p-2 w-11/12"
            value={value}
            onChange={onChange}
        >
            {data.map((item, index) => (
                <option key={index} value={item}>
                    {item}
                </option>
            ))}
        </select>
    </div>
);

export default Dropdown;
