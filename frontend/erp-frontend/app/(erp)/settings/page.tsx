export default function SettingsPage() {
  const settings = [
    {
      title: "Company Profile",
      description: "Nama perusahaan, alamat, kontak, dan logo.",
    },
    {
      title: "User Management",
      description: "Kelola akun admin, staff, finance, gudang, dan produksi.",
    },
    {
      title: "Role Permission",
      description: "Atur hak akses setiap bagian perusahaan.",
    },
    {
      title: "Invoice Template",
      description: "Atur format cetak invoice dan surat jalan.",
    },
    {
      title: "Database Backup",
      description: "Backup data ERP ke server internal perusahaan.",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">
        Settings
      </h1>

      <p className="text-slate-500 mt-2 mb-6">
        Pengaturan sistem ERP perusahaan.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {settings.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-2xl shadow p-6"
          >
            <h2 className="text-lg font-bold mb-2">
              {item.title}
            </h2>

            <p className="text-slate-500 text-sm mb-4">
              {item.description}
            </p>

            <button className="bg-black text-white px-4 py-2 rounded-lg">
              Configure
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}