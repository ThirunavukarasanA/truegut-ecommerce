export default function SettingsPage() {
     return (
          <div className="space-y-6">
               <div>
                    <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
                    <p className="text-gray-500">Manage application settings and preferences</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                         <h3 className="font-bold text-lg mb-4">General Settings</h3>
                         <div className="space-y-4">
                              {/* Placeholders */}
                              <div className="h-10 bg-gray-50 rounded-lg w-full"></div>
                              <div className="h-10 bg-gray-50 rounded-lg w-full"></div>
                         </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                         <h3 className="font-bold text-lg mb-4">Notification Preferences</h3>
                         <div className="space-y-4">
                              {/* Placeholders */}
                              <div className="h-10 bg-gray-50 rounded-lg w-full"></div>
                              <div className="h-10 bg-gray-50 rounded-lg w-full"></div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
