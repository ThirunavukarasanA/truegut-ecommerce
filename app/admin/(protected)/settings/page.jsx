"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { adminFetch } from "@/lib/admin/adminFetch";
import {
  MdStore,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdSave,
  MdLanguage,
  MdCurrencyRupee,
  MdLock,
} from "react-icons/md";
import toast from "react-hot-toast";
import { useSettings } from "@/context/SettingsContext";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminInput from "@/components/admin/common/AdminInput";
import AdminTabs from "@/components/admin/common/AdminTabs";
import AdminCard from "@/components/admin/common/AdminCard";

function SettingsContent() {
  const { reloadSettings } = useSettings();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "Store Profile"
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [settings, setSettings] = useState({
    storeName: "",
    supportEmail: "",
    supportPhone: "",
    storeAddress: "",
    currency: { code: "INR", symbol: "₹" },
  });

  const tabs = ["Store Profile", "Regional Config", "Security"];

  useEffect(() => {
    fetchSettings();
  }, []);



  // ... inside component

  const fetchSettings = async () => {
    try {
      const data = await adminFetch("/api/admin/settings");
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      if (error.message !== 'Unauthorized - Redirecting to login') {
        toast.error("Failed to load settings");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading("Saving configuration...");
    try {
      const data = await adminFetch("/api/admin/settings", {
        method: "POST",
        body: JSON.stringify(settings),
      });
      if (data.success) {
        toast.success("Settings updated successfully", { id: toastId });
        reloadSettings();
      } else {
        toast.error(data.error || "Save failed", { id: toastId });
      }
    } catch (error) {
      if (error.message !== 'Unauthorized - Redirecting to login') {
        toast.error("Network error", { id: toastId });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setChangingPassword(true);
    const toastId = toast.loading("Updating security credentials...");
    try {
      const data = await adminFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (data.success) {
        toast.success("Password updated successfully", { id: toastId });
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.error || "Update failed", { id: toastId });
      }
    } catch (error) {
      if (error.message !== 'Unauthorized - Redirecting to login') {
        toast.error("Network error", { id: toastId });
      }
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-16 bg-gray-100 rounded-3xl w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-50 rounded-[2.5rem]"></div>
          <div className="h-96 bg-gray-50 rounded-[2.5rem]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <AdminPageHeader
        title="Store Settings"
        description="Configure your store profile and system preferences"
        primaryAction={
          activeTab !== "Security"
            ? {
              label: saving ? "Saving..." : "Save Configuration",
              onClick: handleSave,
              icon: MdSave,
              disabled: saving,
            }
            : null
        }
      />

      <div className="space-y-8">
        <div className="flex items-center justify-start overflow-x-auto pb-2 scrollbar-hide">
          <AdminTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "Store Profile" && (
            <AdminCard className="max-w-4xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-bg-color flex items-center justify-center text-primary border border-gray-100">
                  <MdStore size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 leading-none">
                    Business Identity
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Basic information about your store
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <AdminInput
                  label="Business Visual Name"
                  value={settings.storeName}
                  onChange={(e) =>
                    setSettings({ ...settings, storeName: e.target.value })
                  }
                  placeholder="e.g. Fermentaa Kombucha"
                  icon={MdLanguage}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AdminInput
                    label="Customer Support Email"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, supportEmail: e.target.value })
                    }
                    placeholder="support@fermentaa.com"
                    icon={MdEmail}
                  />
                  <AdminInput
                    label="Business Contact Phone"
                    value={settings.supportPhone}
                    onChange={(e) =>
                      setSettings({ ...settings, supportPhone: e.target.value })
                    }
                    placeholder="+91 90000 00000"
                    icon={MdPhone}
                  />
                </div>

                <AdminInput
                  label="Physical Headquater Address"
                  value={settings.storeAddress}
                  onChange={(e) =>
                    setSettings({ ...settings, storeAddress: e.target.value })
                  }
                  placeholder="Full physical address..."
                  icon={MdLocationOn}
                  isTextArea
                  rows={3}
                />
              </div>
            </AdminCard>
          )}

          {activeTab === "Regional Config" && (
            <AdminCard className="max-w-4xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
                  <MdCurrencyRupee size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 leading-none">
                    Regional config
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Currency and localization preferences
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-3xl bg-gray-50/50 border border-gray-100 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 font-bold">
                    Primary Currency
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-light text-gray-900">
                      {settings.currency.code}
                    </span>
                    <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl font-bold border border-gray-100 shadow-sm text-orange-600">
                      {settings.currency.symbol}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 bg-white p-3 rounded-xl border border-gray-100/50 font-light">
                    This is the currency used for all sales records and
                    customer-facing prices.
                  </p>
                </div>

                <div className="p-8 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                    <MdLanguage size={20} />
                  </div>
                  <p className="text-xs font-medium text-gray-500">
                    Multi-currency Support
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-light">
                    Feature coming soon
                  </p>
                </div>
              </div>
            </AdminCard>
          )}

          {activeTab === "Security" && (
            <AdminCard className="max-w-4xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <MdLock size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 leading-none">
                    Access & Safety
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Update your administrative credentials
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-6">
                <AdminInput
                  label="Current Password"
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      oldPassword: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                  icon={MdLock}
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AdminInput
                    label="New Secure Password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Min 6 chars"
                    icon={MdLock}
                    required
                  />
                  <AdminInput
                    label="Confirm New Password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Repeat password"
                    icon={MdLock}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 shadow-lg shadow-emerald-50 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                >
                  <MdLock
                    size={18}
                    className="group-hover:rotate-12 transition-transform"
                  />
                  {changingPassword ? "Updating..." : "Update Credentials"}
                </button>
              </form>
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="h-16 bg-gray-100 rounded-3xl w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-50 rounded-[2.5rem]"></div>
            <div className="h-96 bg-gray-50 rounded-[2.5rem]"></div>
          </div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
