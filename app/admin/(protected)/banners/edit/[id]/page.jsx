"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin/adminFetch";
import { MdArrowBack, MdCloudUpload, MdImage } from "react-icons/md";
import toast from "react-hot-toast";

export default function EditBannerScreen({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    altText: "",
    link: "",
    target: "_self",
    isActive: true,
    order: 0,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchBanner();
  }, [id]);

  const fetchBanner = async () => {
    try {
      const data = await adminFetch(`/api/admin/banners/${id}`);
      if (data.success && data.data) {
        const banner = data.data;
        setFormData({
          title: banner.title || "",
          altText: banner.altText || "",
          link: banner.link || "",
          target: banner.target || "_self",
          isActive: banner.isActive !== undefined ? banner.isActive : true,
          order: banner.order || 0,
        });
        if (banner.image && banner.image.url) {
          setImagePreview(banner.image.url);
        }
      }
    } catch (error) {
      if (error.message !== "Unauthorized - Redirecting to login") {
        toast.error(error.message || "Failed to load banner details");
        router.push("/admin/banners");
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return toast.error("Please provide a banner title");
    }
    if (!imagePreview && !imageFile) {
      return toast.error("Please provide a banner image");
    }

    setLoading(true);
    const toastId = toast.loading("Saving changes...");

    try {
      let bannerData = { ...formData };

      // If user selected a new image, upload it first
      if (imageFile) {
        toast.loading("Uploading new image...", { id: toastId });
        const uploadData = new FormData();
        uploadData.append("file", imageFile);

        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: uploadData,
        });

        const uploadResult = await uploadRes.json();

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Failed to upload image");
        }

        bannerData.image = {
          url: uploadResult.data.url,
          public_id: uploadResult.data.publicId,
        };
      }

      toast.loading("Updating banner...", { id: toastId });

      const saveRes = await adminFetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        body: JSON.stringify(bannerData),
      });

      if (saveRes.success) {
        toast.success("Banner updated successfully!", { id: toastId });
        router.push("/admin/banners");
      } else {
        throw new Error(saveRes.error || "Failed to update banner");
      }
    } catch (error) {
      console.error("Banner update error:", error);
      toast.error(error.message || "Something went wrong", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <button
          onClick={() => router.push("/admin/banners")}
          className="p-2 text-gray-400 hover:text-primary hover:bg-bg-color rounded-xl transition-all"
        >
          <MdArrowBack size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Banner</h1>
          <p className="text-sm text-gray-500 font-light mt-1">
            Update banner information and image
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Upload Column */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Banner Image *
            </label>
            <div
              className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group hover:bg-gray-50
                                        ${imagePreview ? "border-primary/50" : "border-gray-300 hover:border-primary"}
                                        w-full aspect-21/9 bg-gray-50`}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-medium flex items-center gap-2">
                      <MdCloudUpload size={20} /> Change Image
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 text-gray-400 group-hover:text-primary transition-colors">
                  <MdImage className="mx-auto mb-3" size={48} />
                  <p className="font-medium">Click to upload image</p>
                  <p className="text-xs mt-1">Recommended size: 1920x600px</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Details Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Summer Sale 2026"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alt Text
              </label>
              <input
                type="text"
                name="altText"
                value={formData.altText}
                onChange={handleInputChange}
                placeholder="Description for accessibility (SEO)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Link
              </label>
              <div className="flex gap-4">
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="e.g. /collections/summer-sale"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                />
                <select
                  name="target"
                  value={formData.target}
                  onChange={handleInputChange}
                  className="w-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                >
                  <option value="_self">Same Tab</option>
                  <option value="_blank">New Tab</option>
                </select>
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-1">
                Optional. The URL users will go to when they click the banner.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center h-[46px]">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {formData.isActive ? "Active" : "Inactive"}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/banners")}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              "Update Banner"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
