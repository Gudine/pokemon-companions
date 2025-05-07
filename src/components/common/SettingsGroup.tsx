export function SettingsGroup({ title, children }: { title: string, children: any }) {
  return (
    <section class="border-1 border-indigo-700 bg-stone-100 rounded-md overflow-hidden">
      <h3 class="px-2 py-0.5 bg-indigo-700 text-gray-100 text-center">{title}</h3>
        {children}
    </section>
  );
}