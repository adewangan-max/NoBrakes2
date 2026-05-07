"use client";

import { useState, useEffect } from "react";
import { Link, ArrowRight, CheckCircle, AlertCircle, Sparkles, ExternalLink, X, Plus } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug?: string;
};

export default function InternalLinksManager({
  initialPosts,
}: {
  initialPosts: Post[];
}) {
  const [primaryPost, setPrimaryPost] = useState<Post | null>(null);
  const [secondaryPost, setSecondaryPost] = useState<Post | null>(null);
  const [anchorText, setAnchorText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [linkedIds, setLinkedIds] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadLinks() {
      if (!primaryPost) {
        setLinkedIds([]);
        return;
      }
      try {
        const res = await fetch(`/api/internal-links?fromId=${primaryPost.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        if (Array.isArray(data)) {
          setLinkedIds(data.map((d: any) => d.to_post_id));
        } else {
          setLinkedIds([]);
        }
      } catch (err) {
        setLinkedIds([]);
      }
    }

    loadLinks();
    return () => {
      mounted = false;
    };
  }, [primaryPost]);

  const otherPosts = primaryPost
    ? initialPosts.filter((p) => p.id !== primaryPost.id)
    : [];

  const linkedPosts = otherPosts.filter((p) => linkedIds.includes(p.id));
  const unlinkedPosts = otherPosts.filter((p) => !linkedIds.includes(p.id));

  const handlePrimarySelect = (p: Post) => {
    setPrimaryPost(p);
    setSecondaryPost(null);
    setAnchorText("");
    setMessage(null);
    setMessageType(null);
  };

  const handleSecondarySelect = (p: Post) => {
    setSecondaryPost(p);
    setMessage(null);
    setMessageType(null);
  };

  const handleCreateLinks = async () => {
    if (!primaryPost || !secondaryPost || !anchorText.trim()) {
      setMessage("Please select two posts and enter anchor text.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage(null);
    setMessageType(null);
    try {
      const res = await fetch("/api/internal-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromId: primaryPost.id,
          toId: secondaryPost.id,
          anchorText: anchorText.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to create internal links");
      }

      setMessage("✅ Internal links created successfully!");
      setMessageType("success");
      // Refresh linked IDs
      const refreshRes = await fetch(`/api/internal-links?fromId=${primaryPost.id}`);
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (Array.isArray(data)) {
          setLinkedIds(data.map((d: any) => d.to_post_id));
        }
      }
      // Clear selections
      setSecondaryPost(null);
      setAnchorText("");
    } catch (err: any) {
      setMessage(err.message || "Error creating internal links");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setPrimaryPost(null);
    setSecondaryPost(null);
    setAnchorText("");
    setMessage(null);
    setMessageType(null);
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Link className="w-5 h-5 text-black" />
          </div>
          <span className="text-sm font-medium text-amber-400 uppercase tracking-wider">SEO Optimization</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
          Internal Links Manager
        </h1>
        <p className="text-stone-400 text-sm mt-1">
          Create bidirectional internal links between your posts to improve SEO and user engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - All Posts */}
        <div
          className="rounded-2xl bg-gradient-to-br from-amber-500/5 to-yellow-500/5 backdrop-blur-sm border border-amber-500/20 overflow-hidden transition-all duration-500 hover:border-amber-500/40"
          style={{
            animation: isVisible ? `slideInLeft 0.5s ease-out` : "none",
          }}
        >
          <div className="p-5 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent">
            <h2 className="font-bold text-amber-200 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              All Posts
            </h2>
            <p className="text-xs text-stone-500 mt-1">Click on any post to set as source</p>
          </div>
          <div className="p-4 space-y-2 max-h-[60vh] overflow-auto">
            {initialPosts.length === 0 ? (
              <div className="text-center py-12 text-stone-500">
                No posts available. Create some posts first.
              </div>
            ) : (
              initialPosts.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => handlePrimarySelect(p)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group ${primaryPost?.id === p.id
                      ? "bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border border-amber-500/40 shadow-lg shadow-amber-500/10"
                      : "bg-black/30 border border-amber-500/10 hover:border-amber-500/30 hover:bg-amber-500/10"
                    }`}
                  style={{
                    animation: isVisible ? `fadeInUp 0.4s ease-out ${idx * 0.03}s both` : "none",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-white group-hover:text-amber-300 transition-colors">
                        {p.title}
                      </div>
                      {p.slug && (
                        <div className="text-xs text-stone-500 mt-0.5">/post/{p.slug}</div>
                      )}
                    </div>
                    {primaryPost?.id === p.id && (
                      <CheckCircle size={16} className="text-amber-400" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Selection & Linking */}
        <div
          className="rounded-2xl bg-gradient-to-br from-amber-500/5 to-yellow-500/5 backdrop-blur-sm border border-amber-500/20 overflow-hidden transition-all duration-500 hover:border-amber-500/40"
          style={{
            animation: isVisible ? `slideInRight 0.5s ease-out` : "none",
          }}
        >
          <div className="p-5 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-amber-200 flex items-center gap-2">
                <ArrowRight size={18} className="text-amber-400" />
                Link Builder
              </h2>
              {primaryPost && (
                <button
                  onClick={clearSelection}
                  className="text-xs text-stone-500 hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  <X size={12} />
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="p-5">
            {!primaryPost ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Link size={32} className="text-amber-400" />
                </div>
                <p className="text-stone-500 text-sm">
                  Select a post from the left panel to start building internal links.
                </p>
              </div>
            ) : (
              <>
                {/* Primary Post Display */}
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/15 to-yellow-500/15 border border-amber-500/30">
                  <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
                    Source Post
                  </div>
                  <div className="font-bold text-white text-lg">{primaryPost.title}</div>
                  {primaryPost.slug && (
                    <div className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                      <ExternalLink size={10} />
                      /post/{primaryPost.slug}
                    </div>
                  )}
                </div>

                {/* Target Post Selection */}
                <div className="mb-6">
                  <div className="text-sm text-stone-400 mb-3 flex items-center gap-2">
                    <ArrowRight size={14} className="text-amber-400" />
                    Choose target post to link to:
                  </div>

                  <div className="space-y-3 max-h-[40vh] overflow-auto">
                    {/* Already Linked Posts */}
                    {linkedPosts.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                          <CheckCircle size={12} />
                          Already Linked ({linkedPosts.length})
                        </div>
                        <div className="space-y-2">
                          {linkedPosts.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => handleSecondarySelect(p)}
                              className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-300 ${secondaryPost?.id === p.id
                                  ? "bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border border-amber-500/40"
                                  : "bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20"
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-white">{p.title}</div>
                                  {p.slug && <div className="text-xs text-stone-500">/post/{p.slug}</div>}
                                </div>
                                {secondaryPost?.id === p.id && (
                                  <CheckCircle size={14} className="text-amber-400" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Unlinked Posts */}
                    {unlinkedPosts.length > 0 && (
                      <div className={linkedPosts.length > 0 ? "mt-4" : ""}>
                        <div className="text-xs font-semibold text-stone-400 mb-2 flex items-center gap-1.5">
                          <Plus size={12} />
                          Available to Link ({unlinkedPosts.length})
                        </div>
                        <div className="space-y-2">
                          {unlinkedPosts.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => handleSecondarySelect(p)}
                              className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-300 ${secondaryPost?.id === p.id
                                  ? "bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border border-amber-500/40"
                                  : "bg-stone-800/50 border border-stone-700/50 hover:border-amber-500/30 hover:bg-amber-500/10"
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-white">{p.title}</div>
                                  {p.slug && <div className="text-xs text-stone-500">/post/{p.slug}</div>}
                                </div>
                                {secondaryPost?.id === p.id && (
                                  <CheckCircle size={14} className="text-amber-400" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {linkedPosts.length === 0 && unlinkedPosts.length === 0 && (
                      <div className="text-center py-8 text-stone-500">
                        No other posts available to link to.
                      </div>
                    )}
                  </div>
                </div>

                {/* Anchor Text Input */}
                {secondaryPost && (
                  <div className="mt-6 animate-in slide-in-from-bottom-2">
                    <label className="text-sm text-stone-400 mb-2 block">Anchor Text</label>
                    <input
                      value={anchorText}
                      onChange={(e) => setAnchorText(e.target.value)}
                      className="w-full bg-black/40 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                      placeholder={`e.g., "click here to read more about ${secondaryPost.title}"`}
                    />
                    <p className="text-[10px] text-stone-600 mt-1">
                      This text will be used as the clickable link from "{primaryPost.title}" to "{secondaryPost.title}"
                    </p>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleCreateLinks}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold transition-all duration-300 shadow-lg shadow-amber-500/25 disabled:opacity-50 group"
                      >
                        {loading ? (
                          <Spinner />
                        ) : (
                          <>
                            <Link size={16} className="group-hover:scale-110 transition-transform" />
                            Create Bi-directional Link
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setSecondaryPost(null)}
                        className="px-5 py-3 rounded-xl bg-stone-800/50 border border-stone-700 text-stone-400 hover:text-white hover:border-stone-600 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Display */}
                {message && (
                  <div className={`mt-4 p-3 rounded-xl flex items-start gap-2 text-sm ${messageType === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                    }`}>
                    {messageType === "success" ? (
                      <CheckCircle size={16} className="shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    )}
                    {message}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-8 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center">
        <p className="text-xs text-stone-500">
          💡 Internal links help search engines understand your site structure and improve page authority.
          Links are created bidirectionally between the source and target posts.
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation: slideInFromBottom 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}