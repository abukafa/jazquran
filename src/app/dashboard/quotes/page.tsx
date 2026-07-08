"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toPng } from "html-to-image";

interface QuoteData {
  _id: string;
  text: string;
  verseRef: string;
  verseText: string;
  verseTranslation: string;
  authorId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  likes: string[]; // array of user IDs
  createdAt: string;
}

export default function QuotesQuraniPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal State
  const [surahs, setSurahs] = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState("");
  const [selectedAyah, setSelectedAyah] = useState("");
  const [isFetchingAyah, setIsFetchingAyah] = useState(false);
  const [newQuote, setNewQuote] = useState({ text: "", verseText: "", verseTranslation: "", verseRef: "" });

  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/quotes");
      const json = await res.json();
      if (json.success) {
        setQuotes(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();

    // Fetch surahs for modal
    fetch("https://equran.id/api/v2/surat")
      .then(res => res.json())
      .then(res => setSurahs(res.data || []))
      .catch(console.error);
  }, []);

  const handleFetchAyah = async () => {
    if (!selectedSurah || !selectedAyah) return;
    setIsFetchingAyah(true);
    try {
      const res = await fetch(`https://equran.id/api/v2/surat/${selectedSurah}`);
      const data = await res.json();
      if (data.data && data.data.ayat) {
        const ayahData = data.data.ayat[Number(selectedAyah) - 1];
        setNewQuote({
          ...newQuote,
          verseText: ayahData.teksArab,
          verseTranslation: ayahData.teksIndonesia,
          verseRef: `${data.data.namaLatin} (${data.data.nomor}): ${ayahData.nomorAyat}`
        });
      }
    } catch (e) {
      alert("Gagal mengambil ayat");
    } finally {
      setIsFetchingAyah(false);
    }
  };

  const handleSubmit = async () => {
    if (!newQuote.text || !newQuote.verseText) return alert("Mohon isi teks quote dan tarik ayat inspirasi");
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuote),
      });
      const json = await res.json();
      
      if (json.success) {
        setIsModalOpen(false);
        // Reset form
        setNewQuote({ text: "", verseText: "", verseTranslation: "", verseRef: "" });
        setSelectedSurah("");
        setSelectedAyah("");
        // Refresh quotes
        fetchQuotes();
      } else {
        alert(json.message || "Gagal menyimpan quote");
      }
    } catch (e) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (quoteId: string) => {
    if (!userId) {
      return alert("Silakan login terlebih dahulu untuk menyukai quote.");
    }

    // Optimistic Update
    setQuotes(prev => prev.map(q => {
      if (q._id === quoteId) {
        const hasLiked = q.likes.includes(userId);
        return {
          ...q,
          likes: hasLiked ? q.likes.filter(id => id !== userId) : [...q.likes, userId]
        };
      }
      return q;
    }));

    try {
      await fetch(`/api/quotes/${quoteId}/like`, { method: "POST" });
    } catch (e) {
      console.error("Like failed", e);
      // Optional: Revert optimistic update here
      fetchQuotes();
    }
  };

  const handleDownload = async (quoteId: string, authorName: string) => {
    const node = document.getElementById(`quote-card-${quoteId}`);
    if (!node) return;
    
    try {
      const footer = document.getElementById(`quote-footer-${quoteId}`);
      if (footer) footer.style.display = 'none';

      // Ignore IMG tags to avoid CORS issues completely, and skip fonts
      const filter = (node: HTMLElement) => {
        if (node.tagName === 'IMG') return false;
        return true;
      };

      const dataUrl = await toPng(node, { 
        quality: 1, 
        backgroundColor: '#ffffff', 
        pixelRatio: 2, 
        cacheBust: true,
        skipFonts: true,
        filter
      });
      
      if (footer) footer.style.display = 'flex';

      const link = document.createElement('a');
      link.download = `Quote_by_${authorName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error: any) {
      console.error('Failed to download image', error?.message || error);
      alert('Gagal mengunduh gambar. Jika ini terus terjadi, coba masuk menggunakan mode Incognito.');
    }
  };

  const handleShare = async (quoteId: string, quoteText: string) => {
    const node = document.getElementById(`quote-card-${quoteId}`);
    if (!node) return;
    
    try {
      const footer = document.getElementById(`quote-footer-${quoteId}`);
      if (footer) footer.style.display = 'none';

      const filter = (node: HTMLElement) => {
        if (node.tagName === 'IMG') return false;
        return true;
      };

      const dataUrl = await toPng(node, { 
        quality: 1, 
        backgroundColor: '#ffffff', 
        pixelRatio: 2, 
        cacheBust: true,
        skipFonts: true,
        filter
      });
      
      if (footer) footer.style.display = 'flex';

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'quote.png', { type: blob.type });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Quotes Qurani',
          text: `"${quoteText}" - Temukan kutipan inspiratif lainnya di JazQuran.`,
          files: [file],
        });
      } else if (navigator.share) {
        // Fallback share text only if browser cannot share files
        await navigator.share({
          title: 'Quotes Qurani',
          text: `"${quoteText}" - Temukan kutipan inspiratif lainnya di JazQuran.`,
        });
      } else {
        alert("Browser Anda tidak mendukung fitur Share langsung. Silakan gunakan tombol Download.");
      }
    } catch (error: any) {
      console.error('Error sharing:', error?.message || error);
      alert('Gagal memproses gambar untuk dibagikan.');
    }
  };

  const selectedSurahData = surahs.find(s => s.nomor.toString() === selectedSurah);
  const numAyahs = selectedSurahData ? selectedSurahData.jumlahAyat : 0;

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-sage-800 flex items-center gap-2">
          <Link href="/dashboard" className="text-sage-500 hover:text-sage-700 transition">
            <i className="fas fa-arrow-left text-lg"></i>
          </Link>
          Quotes Qurani
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-10 h-10 bg-sage-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-sage-700 hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-sage-200"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {/* Feed List */}
      <div className="space-y-8 pb-10">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            Belum ada quote. Jadilah yang pertama!
          </div>
        ) : (
          quotes.map((quote) => {
            const hasLiked = userId && quote.likes.includes(userId);
            
            return (
              <div id={`quote-card-${quote._id}`} key={quote._id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-sage-100 relative overflow-hidden">
                {/* Background Texture/Decoration */}
                <div className="absolute top-0 right-0 opacity-5 text-8xl -mt-6 -mr-6 pointer-events-none">
                  <i className="fas fa-quote-right"></i>
                </div>

                {/* Creator Profile (Moved to Top Left) */}
                <div className="flex items-center gap-3 mb-5 relative z-10">
                  {quote.authorId?.avatar ? (
                    <img 
                      src={quote.authorId.avatar} 
                      alt={quote.authorId.name || "User"}
                      className="w-8 h-8 rounded-full object-cover shadow-inner"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-sage-200 text-sage-600 rounded-full flex items-center justify-center text-xs font-bold shadow-inner">
                      {(quote.authorId?.name || "U").substring(0,2).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-slate-700">{quote.authorId?.name || "Unknown"}</span>
                </div>

                {/* Quote Text */}
                <p className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed mb-6 relative z-10 font-serif">
                  "{quote.text}"
                </p>

                {/* Ayah Inspiration */}
                <div className="bg-sage-50 p-4 rounded-2xl border border-sage-100 mb-6">
                  <div className="text-xs uppercase font-bold text-sage-500 tracking-wider mb-3">Terinspirasi dari:</div>
                  <p className="text-right font-arab text-xl leading-loose text-slate-800 mb-3" dir="rtl">
                    {quote.verseText}
                  </p>
                  <p className="text-sm text-slate-600 italic mb-2">
                    "{quote.verseTranslation}"
                  </p>
                  <p className="text-xs font-bold text-sage-700">
                    — QS. {quote.verseRef}
                  </p>
                </div>

                {/* Footer (Actions Only now) */}
                <div id={`quote-footer-${quote._id}`} className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 relative z-10">
                  {/* Like Button */}
                  <button 
                    onClick={() => handleLike(quote._id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors group ${hasLiked ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}
                  >
                    <i className={`${hasLiked ? 'fas' : 'far'} fa-heart group-hover:scale-110 transition-transform`}></i>
                    <span className="font-bold text-sm">{quote.likes.length}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleShare(quote._id, quote.text)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors" 
                      title="Share"
                    >
                      <i className="fas fa-share-alt"></i>
                    </button>
                    <button 
                      onClick={() => handleDownload(quote._id, quote.authorId?.name || "Unknown")}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-sage-600 hover:bg-sage-50 rounded-full transition-colors" 
                      title="Download Image"
                    >
                      <i className="fas fa-download"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Quote Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Buat Quotes Qurani</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 space-y-6">
              
              {/* Step 1: Pick Ayah */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">1. Tarik Ayat Inspirasi</label>
                <div className="flex gap-2">
                  <select 
                    value={selectedSurah} 
                    onChange={(e) => { setSelectedSurah(e.target.value); setSelectedAyah(""); }}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                  >
                    <option value="">-- Pilih Surah --</option>
                    {surahs.map(s => (
                      <option key={s.nomor} value={s.nomor}>{s.nomor}. {s.namaLatin}</option>
                    ))}
                  </select>
                  
                  <select 
                    value={selectedAyah} 
                    onChange={(e) => setSelectedAyah(e.target.value)}
                    disabled={!selectedSurah}
                    className="w-24 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 focus:border-sage-500 disabled:opacity-50"
                  >
                    <option value="">Ayat</option>
                    {Array.from({length: numAyahs}).map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1}</option>
                    ))}
                  </select>
                  
                  <button 
                    onClick={handleFetchAyah}
                    disabled={!selectedSurah || !selectedAyah || isFetchingAyah}
                    className="px-4 py-2 bg-sage-100 text-sage-700 rounded-xl text-sm font-bold hover:bg-sage-200 disabled:opacity-50 transition flex-shrink-0"
                  >
                    {isFetchingAyah ? <i className="fas fa-spinner fa-spin"></i> : "Tarik"}
                  </button>
                </div>
              </div>

              {/* Step 2: Edit Ayah */}
              {newQuote.verseText && (
                <div className="space-y-3 bg-sage-50 p-4 rounded-2xl border border-sage-100">
                  <label className="block text-sm font-semibold text-sage-800">Teks Ayat (Bisa diedit/dihapus sebagian)</label>
                  <textarea 
                    dir="rtl"
                    value={newQuote.verseText}
                    onChange={(e) => setNewQuote({...newQuote, verseText: e.target.value})}
                    className="w-full px-3 py-2 border border-sage-200 rounded-xl text-right font-arab text-xl focus:ring-2 focus:ring-sage-500 focus:border-sage-500 bg-white"
                    rows={2}
                  />
                  <textarea 
                    value={newQuote.verseTranslation}
                    onChange={(e) => setNewQuote({...newQuote, verseTranslation: e.target.value})}
                    className="w-full px-3 py-2 border border-sage-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-sage-500 focus:border-sage-500 bg-white"
                    rows={2}
                  />
                </div>
              )}

              {/* Step 3: Write Quote */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">2. Tulis Kata Mutiara Anda</label>
                <textarea 
                  value={newQuote.text}
                  onChange={(e) => setNewQuote({...newQuote, text: e.target.value})}
                  placeholder="Misal: Jangan bersedih, Allah bersama kita..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-base focus:ring-2 focus:ring-sage-500 focus:border-sage-500 min-h-[100px]"
                />
              </div>

            </div>
            
            {/* Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition"
              >
                Batal
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-sage-600 text-white font-bold rounded-xl shadow-md hover:bg-sage-700 transition hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Memproses...</> : "Posting Quote"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
