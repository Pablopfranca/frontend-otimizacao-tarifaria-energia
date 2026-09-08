type Props = {
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
};

export function SearchBar({ valor, onChange, placeholder }: Props) {
  return (
    <label className="block">
      <span className="sr-only">Buscar</span>
      <input
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Buscar por nome ou número…"}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-emerald-700/80 focus:ring-1 focus:ring-emerald-700/50"
      />
    </label>
  );
}
