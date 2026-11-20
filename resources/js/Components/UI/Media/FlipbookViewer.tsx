import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { PageFlip } from 'page-flip';
import * as pdfjsLib from 'pdfjs-dist';
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Download,
    FileText,
    List,
    Loader2,
    Maximize2,
    Minimize2,
    RotateCcw,
    Volume2,
    VolumeX,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

// React Error Boundary to safeguard against DOM manipulation crashes from third-party flipbook libraries
interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class FlipbookErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.warn('FlipbookViewer ErrorBoundary caught error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm my-4">
                    <p className="text-sm font-bold text-slate-800">Tampilan dokumen sedang disesuaikan.</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        Flipbook mendeteksi pembaruan tata letak dokumen.
                    </p>
                    <button
                        type="button"
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="mt-3 px-4 py-2 bg-[#102B40] text-white text-xs font-semibold rounded-lg hover:bg-[#1a3d58] transition-colors cursor-pointer"
                    >
                        Segarkan Viewer
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export interface FlipbookPage {
    page_number: number;
    is_even: boolean;
    type?: string;
    title: string;
    subtitle?: string;
    japanese_term?: string;
    content: string[] | string;
    callout?: string;
    footer_note?: string;
}

interface PdfRenderedPage {
    pageNumber: number;
    imgUrl: string;
    width: number;
    height: number;
    isLandscape: boolean;
}

interface FlipbookViewerProps {
    title: string;
    subtitle?: string;
    organization?: string;
    pdfUrl?: string | null;
    pages: FlipbookPage[];
    className?: string;
}

const FlipbookViewerInternal: React.FC<FlipbookViewerProps> = ({
    title,
    subtitle = 'Dokumen Pedoman Resmi Shorinji Kempo',
    organization = 'PB PERKEMI',
    pdfUrl,
    pages = [],
    className,
}) => {
    // Mount point where PageFlip creates its detached DOM elements
    const bookMountRef = useRef<HTMLDivElement>(null);
    // Hidden source template for Dokuhon HTML pages to clone from without touching React's DOM tree
    const sourceTemplateRef = useRef<HTMLDivElement>(null);
    const pageFlipInstance = useRef<PageFlip | null>(null);

    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [flipState, setFlipState] = useState<'read' | 'flipping' | 'user_fold' | 'fold_corner'>('read');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [showToc, setShowToc] = useState(false);
    const [zoomLevel, setZoomLevel] = useState<100 | 110>(100);
    const [viewMode, setViewMode] = useState<'flipbook' | 'pdf'>('flipbook');
    const [spreadMode, setSpreadMode] = useState<'single' | 'dual'>('dual');

    // Dynamic viewport tracking: ensures the entire book is 100% visible with zero vertical scrolling
    const [windowDimensions, setWindowDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800,
    });

    // PDF rendering states
    const [pdfPages, setPdfPages] = useState<PdfRenderedPage[]>([]);
    const [isLoadingPdf, setIsLoadingPdf] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);

    const rootWrapperRef = useRef<HTMLDivElement>(null);

    // Track window resize and fullscreenchange to guarantee accurate viewport and ZERO vertical scrolling
    useEffect(() => {
        const updateDimensions = () => {
            if (typeof window === 'undefined') return;
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        const handleFullscreenChange = () => {
            const isFull = !!(
                document.fullscreenElement ||
                (document as any).webkitFullscreenElement
            );
            setIsFullscreen(isFull);
            updateDimensions();
            setTimeout(() => {
                updateDimensions();
                pageFlipInstance.current?.update();
            }, 100);
            setTimeout(() => {
                updateDimensions();
                pageFlipInstance.current?.update();
            }, 350);
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

        return () => {
            window.removeEventListener('resize', updateDimensions);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Responsive initial spreadMode: single for small screens (<640px), dual for desktop
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 640) {
            setSpreadMode('single');
        }
    }, []);

    // Procedural paper rustle audio using Web Audio API
    const playPaperSound = () => {
        if (!isSoundEnabled) return;
        try {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const duration = 0.16;
            const bufferSize = Math.floor(ctx.sampleRate * duration);
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                const envelope = Math.exp(-i / (ctx.sampleRate * 0.04));
                data[i] = (Math.random() * 2 - 1) * envelope * 0.16;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + duration);

            noise.connect(filter);
            filter.connect(ctx.destination);
            noise.start();
        } catch {
            // Audio policy safe-fail
        }
    };

    // Load and render actual uploaded PDF pages using PDF.js with Retina/HiDPI sharpness
    useEffect(() => {
        if (!pdfUrl) {
            setPdfPages([]);
            setIsLoadingPdf(false);
            return;
        }

        let isCancelled = false;
        setIsLoadingPdf(true);
        setPdfError(null);

        const loadPdfDocument = async () => {
            try {
                pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

                const loadingTask = pdfjsLib.getDocument({
                    url: pdfUrl,
                    cMapUrl: '/cmaps/',
                    cMapPacked: true,
                    standardFontDataUrl: '/standard_fonts/',
                });

                const pdfDoc = await loadingTask.promise;
                const rendered: PdfRenderedPage[] = [];

                // Use devicePixelRatio * 1.5 (minimum 2.5) for crisp, razor-sharp text on Retina displays
                const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
                const renderScale = Math.max(dpr * 1.5, 2.5);

                for (let i = 1; i <= pdfDoc.numPages; i++) {
                    if (isCancelled) return;
                    const page = await pdfDoc.getPage(i);
                    const unscaledViewport = page.getViewport({ scale: 1.0 });
                    const isLandscape = unscaledViewport.width > unscaledViewport.height;

                    const viewport = page.getViewport({ scale: renderScale });
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    const ctx = canvas.getContext('2d', { alpha: false });

                    if (ctx) {
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';

                        await page.render({
                            canvasContext: ctx,
                            viewport,
                            intent: 'print', // Print intent yields highest vector and typography quality in PDF.js
                        }).promise;

                        rendered.push({
                            pageNumber: i,
                            // High quality lossless/near-lossless WebP to prevent JPEG artifact blur around text
                            imgUrl: canvas.toDataURL('image/webp', 0.98),
                            width: viewport.width,
                            height: viewport.height,
                            isLandscape,
                        });
                    }
                }

                if (!isCancelled) {
                    setPdfPages(rendered);
                    setIsLoadingPdf(false);
                }
            } catch (err: any) {
                console.error('Failed to render PDF pages with PDF.js:', err);
                if (!isCancelled) {
                    setPdfError(err?.message || 'Gagal memuat dokumen PDF');
                    setIsLoadingPdf(false);
                }
            }
        };

        loadPdfDocument();

        return () => {
            isCancelled = true;
        };
    }, [pdfUrl]);

    // Determine if this is an uploaded PDF or structured Dokuhon
    const hasRealPdf = pdfPages.length > 0;
    const isSinglePageDocument = hasRealPdf ? pdfPages.length === 1 : pages.length === 0;

    // Mode helper
    const isSingleMode = spreadMode === 'single' || isSinglePageDocument;

    // Total page count for calculations
    const totalEffectivePages = hasRealPdf ? pdfPages.length : (pages.length > 0 ? pages.length + 1 : 1);

    // Auto-select single mode for 1-page documents
    useEffect(() => {
        if (isSinglePageDocument) {
            setSpreadMode('single');
        }
    }, [isSinglePageDocument]);

    // Aspect ratio and geometry calculations
    const pdfW = hasRealPdf ? (pdfPages[0]?.width || 595) : 490;
    const pdfH = hasRealPdf ? (pdfPages[0]?.height || 842) : 690;
    const pageAspect = pdfW / pdfH;

    // Height strictly constrained by viewport to guarantee ZERO vertical scrolling
    const availableHeight = isFullscreen
        ? Math.max(windowDimensions.height - 110, 360)
        : Math.max(Math.min(windowDimensions.height - 230, 680), 380);

    const availableWidth = isFullscreen
        ? windowDimensions.width - 48
        : Math.min(windowDimensions.width - 48, 1100);

    // Single page dimensions strictly bounded by available height and width
    let singlePageH = availableHeight;
    let singlePageW = Math.round(singlePageH * pageAspect);

    if (spreadMode === 'dual' && !isSinglePageDocument) {
        if (singlePageW * 2 > availableWidth) {
            singlePageW = Math.floor(availableWidth / 2);
            singlePageH = Math.round(singlePageW / pageAspect);
        }
    } else {
        if (singlePageW > availableWidth) {
            singlePageW = availableWidth;
            singlePageH = Math.round(singlePageW / pageAspect);
        }
    }

    const spreadWidth = singlePageW * 2;

    // Front cover and back cover positioning logic:
    // In dual mode (Buku):
    // - Page 0 is Front Cover: PageFlip renders it on the right half (50% to 100%). Shifting by -25% centers it on the desk.
    // - Inside pages (pages 2 & 3, 4 & 5, etc.) are 2 pages side-by-side with central spine crease.
    // - If total pages is even, last page is Back Cover: PageFlip renders it on the left half (0% to 50%). Shifting by +25% centers it.
    // In single mode:
    // - Every page is 1 page centered with 3D curl animation.
    const isCover = !isSinglePageDocument && spreadMode === 'dual' && currentPageIndex === 0;
    const isBackCover = !isSinglePageDocument && spreadMode === 'dual' && totalEffectivePages > 1 && (totalEffectivePages % 2 === 0) && currentPageIndex === totalEffectivePages - 1;

    // Translation shift to center the front cover (-25%) or back cover (+25%)
    const mountTranslateX = isCover ? '-25%' : isBackCover ? '25%' : '0%';

    // Initialize PageFlip library
    useEffect(() => {
        if (
            !bookMountRef.current ||
            viewMode !== 'flipbook' ||
            isLoadingPdf
        ) {
            if (pageFlipInstance.current) {
                try {
                    pageFlipInstance.current.destroy();
                } catch {
                    // Safe cleanup
                }
                pageFlipInstance.current = null;
            }
            if (bookMountRef.current) {
                bookMountRef.current.innerHTML = '';
            }
            return;
        }

        let isMounted = true;

        const initTimer = setTimeout(() => {
            if (!bookMountRef.current || !isMounted) return;

            try {
                if (pageFlipInstance.current) {
                    try {
                        pageFlipInstance.current.destroy();
                    } catch { }
                    pageFlipInstance.current = null;
                }

                // Clean mount container
                bookMountRef.current.innerHTML = '';

                const isDual = spreadMode === 'dual' && !isSinglePageDocument;
                const bookWidth = isDual ? spreadWidth : singlePageW;
                const bookHeight = singlePageH;

                // Create detached unmanaged DOM node with transparent background and zero shadows on the container.
                // Shadows are applied directly to each active page item, eliminating any ghost white background on covers!
                const bookEl = document.createElement('div');
                bookEl.className = 'flip-book bg-transparent';
                bookEl.style.width = `${bookWidth}px`;
                bookEl.style.maxWidth = '100%';
                bookEl.style.height = `${bookHeight}px`;
                bookEl.style.maxHeight = `${bookHeight}px`;
                bookEl.style.background = 'transparent';
                bookEl.style.boxShadow = 'none';
                bookEl.style.border = 'none';
                bookMountRef.current.appendChild(bookEl);

                const pageFlip = new PageFlip(bookEl, {
                    width: singlePageW,
                    height: singlePageH,
                    size: 'stretch',
                    // Setting minWidth to singlePageW in single mode ensures blockWidth < minWidth * 2 is TRUE,
                    // which forces PageFlip to strictly activate Orientation.PORTRAIT (1 page mode)!
                    minWidth: isDual ? 150 : singlePageW,
                    maxWidth: 2400,
                    minHeight: 150,
                    maxHeight: 2000,
                    maxShadowOpacity: 0.35,
                    showCover: isDual, // Single mode: all pages are individual. Dual mode: showCover true for front cover
                    mobileScrollSupport: false,
                    usePortrait: !isDual, // Single mode: TRUE (portrait single page flippage). Dual mode: FALSE (2-page landscape spreads)
                    drawShadow: true,
                    flippingTime: 600,
                    useMouseEvents: true,
                    swipeDistance: 25,
                    showPageCorners: true,
                    startPage: Math.min(currentPageIndex, totalEffectivePages - 1),
                });

                if (hasRealPdf) {
                    // Heyzine-inspired high-fidelity rendering:
                    // Render each PDF page with native high-DPI <img> and photorealistic spine & gutter overlays.
                    pdfPages.forEach((page, idx) => {
                        const isCoverPage = idx === 0;
                        const isLastPage = idx === pdfPages.length - 1;
                        const isLeftPageInSpread = idx % 2 !== 0; // In PageFlip spreads: idx 1,3,5 are left pages

                        const item = document.createElement('div');
                        item.className = 'flipbook-page-item';
                        item.setAttribute('data-density', isCoverPage || (isLastPage && pdfPages.length % 2 === 0) ? 'hard' : 'soft');

                        // Heyzine corner rounding (4px on outer edges)
                        const roundingStyle = isDual
                            ? isCoverPage
                                ? 'border-radius: 4px;'
                                : isLastPage && pdfPages.length % 2 === 0
                                    ? 'border-radius: 4px 0 0 4px;'
                                    : isLeftPageInSpread
                                        ? 'border-radius: 4px 0 0 4px;'
                                        : 'border-radius: 0 4px 4px 0;'
                            : 'border-radius: 4px;';

                        // Heyzine soft realistic page drop shadows
                        const shadowStyle = isDual
                            ? isCoverPage
                                ? 'box-shadow: 0 10px 30px -4px rgba(0, 0, 0, 0.16), 0 3px 8px -1px rgba(0, 0, 0, 0.08);'
                                : isLastPage && pdfPages.length % 2 === 0
                                    ? 'box-shadow: -6px 10px 24px -4px rgba(0, 0, 0, 0.14), 0 2px 6px -1px rgba(0, 0, 0, 0.06);'
                                    : isLeftPageInSpread
                                        ? 'box-shadow: -6px 10px 24px -4px rgba(0, 0, 0, 0.14), 0 2px 6px -1px rgba(0, 0, 0, 0.06);'
                                        : 'box-shadow: 6px 10px 24px -4px rgba(0, 0, 0, 0.14), 0 2px 6px -1px rgba(0, 0, 0, 0.06);'
                            : 'box-shadow: 0 10px 30px -4px rgba(0, 0, 0, 0.16), 0 3px 8px -1px rgba(0, 0, 0, 0.08);';

                        // Heyzine photorealistic spine & gutter overlays:
                        // In 2-page spread: Left page has right-side gutter; Right page has left-side gutter.
                        // Together they meet seamlessly at the center fold line (no lines, no overflow!).
                        // In Cover & Single page: Left-side spine depth gradient (matching Image 1).
                        let spineOverlay = '';
                        if (isDual) {
                            if (isCoverPage) {
                                spineOverlay = `<div style="position:absolute; top:0; left:0; bottom:0; width:30px; pointer-events:none; z-index:10; background:linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.06) 30%, transparent 100%);"></div>`;
                            } else if (isLastPage && pdfPages.length % 2 === 0) {
                                spineOverlay = `<div style="position:absolute; top:0; right:0; bottom:0; width:30px; pointer-events:none; z-index:10; background:linear-gradient(to left, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.06) 30%, transparent 100%);"></div>`;
                            } else if (isLeftPageInSpread) {
                                spineOverlay = `<div style="position:absolute; top:0; right:0; bottom:0; width:44px; pointer-events:none; z-index:10; background:linear-gradient(to left, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.08) 28%, rgba(0,0,0,0.02) 65%, transparent 100%);"></div>`;
                            } else {
                                spineOverlay = `<div style="position:absolute; top:0; left:0; bottom:0; width:44px; pointer-events:none; z-index:10; background:linear-gradient(to right, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.08) 28%, rgba(0,0,0,0.02) 65%, transparent 100%);"></div>`;
                            }
                        } else {
                            // Single mode (Image 1): subtle spine depth on the left edge
                            spineOverlay = `<div style="position:absolute; top:0; left:0; bottom:0; width:30px; pointer-events:none; z-index:10; background:linear-gradient(to right, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0.05) 30%, transparent 100%);"></div>`;
                        }

                        item.innerHTML = `
                            <div class="w-full h-full relative overflow-hidden select-none bg-white" style="width:100%; height:100%; box-sizing:border-box; ${roundingStyle} ${shadowStyle}">
                                <img src="${page.imgUrl}" alt="Halaman ${page.pageNumber}" class="w-full h-full pointer-events-none select-none" style="width:100%; height:100%; object-fit:fill; display:block; ${roundingStyle}" />
                                ${spineOverlay}
                            </div>
                        `;
                        bookEl.appendChild(item);
                    });

                    pageFlip.loadFromHTML(bookEl.querySelectorAll<HTMLElement>('.flipbook-page-item'));
                    setTotalPageCount(pageFlip.getPageCount());

                    pageFlip.on('flip', (e: { data: number }) => {
                        setCurrentPageIndex(e.data);
                        playPaperSound();
                    });

                    pageFlip.on('changeState', (e: { data: string }) => {
                        setFlipState(e.data as any);
                    });

                    pageFlipInstance.current = pageFlip;
                } else {
                    // For Dokuhon, clone nodes from hidden sourceTemplateRef so React's tree remains completely untouched
                    const pageElements = sourceTemplateRef.current?.querySelectorAll<HTMLElement>('.flipbook-page-item');
                    if (pageElements && pageElements.length > 0) {
                        const clonedElements = Array.from(pageElements).map((el) => el.cloneNode(true) as HTMLElement);
                        clonedElements.forEach((el) => bookEl.appendChild(el));

                        pageFlip.loadFromHTML(bookEl.querySelectorAll<HTMLElement>('.flipbook-page-item'));
                        setTotalPageCount(pageFlip.getPageCount());

                        pageFlip.on('flip', (e: { data: number }) => {
                            setCurrentPageIndex(e.data);
                            playPaperSound();
                        });

                        pageFlip.on('changeState', (e: { data: string }) => {
                            setFlipState(e.data as any);
                        });

                        pageFlipInstance.current = pageFlip;
                    }
                }
            } catch (err) {
                console.error('PageFlip initialization error:', err);
            }
        }, 100);

        return () => {
            isMounted = false;
            clearTimeout(initTimer);
            if (pageFlipInstance.current) {
                try {
                    pageFlipInstance.current.destroy();
                } catch {
                    // Safe cleanup
                }
                pageFlipInstance.current = null;
            }
            if (bookMountRef.current) {
                bookMountRef.current.innerHTML = '';
            }
        };
    }, [pages, viewMode, pdfPages, isLoadingPdf, hasRealPdf, spreadMode, singlePageW, singlePageH, spreadWidth, isSinglePageDocument]);

    // Handle window resize & zoom updates
    useEffect(() => {
        const handleResize = () => {
            if (pageFlipInstance.current) {
                try {
                    pageFlipInstance.current.update();
                } catch {
                    // Safe fail
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fullscreen toggle
    const toggleFullscreen = () => {
        if (!rootWrapperRef.current) return;
        const isCurrentlyFullscreen = !!(
            document.fullscreenElement ||
            (document as any).webkitFullscreenElement
        );

        if (!isCurrentlyFullscreen) {
            if (rootWrapperRef.current.requestFullscreen) {
                rootWrapperRef.current.requestFullscreen().catch(() => { });
            } else if ((rootWrapperRef.current as any).webkitRequestFullscreen) {
                (rootWrapperRef.current as any).webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => { });
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen();
            }
        }
    };

    // Navigation actions (Always uses PageFlip 3D animated flips in both modes!)
    const handleNext = () => {
        if (isSinglePageDocument) return;
        if (pageFlipInstance.current) {
            pageFlipInstance.current.flipNext('top');
        }
    };

    const handlePrev = () => {
        if (isSinglePageDocument) return;
        if (pageFlipInstance.current) {
            pageFlipInstance.current.flipPrev('top');
        }
    };

    const jumpToPage = (targetIndex: number) => {
        if (isSinglePageDocument) return;
        if (pageFlipInstance.current) {
            pageFlipInstance.current.flip(targetIndex);
            setShowToc(false);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            } else if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentPageIndex, hasRealPdf, spreadMode, isFullscreen, isSinglePageDocument]);

    // Generate Table of Contents items matching current spreadMode
    const getTocItems = () => {
        if (!hasRealPdf) {
            // Dokuhon text
            if (isSingleMode) {
                const items = [
                    {
                        label: 'Cover Depan Buku',
                        targetIndex: 0,
                        subLabel: 'Sampul Depan',
                        isActive: currentPageIndex === 0,
                    },
                ];
                pages.forEach((p, idx) => {
                    items.push({
                        label: `Halaman ${p.page_number}. ${p.title}`,
                        targetIndex: idx + 1,
                        subLabel: p.japanese_term || (p.is_even ? 'Genap' : 'Ganjil'),
                        isActive: currentPageIndex === idx + 1,
                    });
                });
                return items;
            }

            const items = [
                {
                    label: 'Cover Depan Buku',
                    targetIndex: 0,
                    subLabel: 'Sampul',
                    isActive: currentPageIndex === 0,
                },
            ];
            for (let i = 0; i < pages.length; i += 2) {
                const p1 = pages[i];
                const p2 = pages[i + 1];
                if (p2) {
                    items.push({
                        label: `Hal. ${p1.page_number} & ${p2.page_number}`,
                        targetIndex: i + 1,
                        subLabel: `${p1.title} / ${p2.title}`,
                        isActive: currentPageIndex === i + 1 || currentPageIndex === i + 2,
                    });
                } else {
                    items.push({
                        label: `Hal. ${p1.page_number}`,
                        targetIndex: i + 1,
                        subLabel: p1.title,
                        isActive: currentPageIndex === i + 1,
                    });
                }
            }
            return items;
        }

        const total = pdfPages.length;

        // In 1 Halaman mode: list individual pages
        if (isSingleMode) {
            return pdfPages.map((page, idx) => ({
                label: `Halaman ${page.pageNumber}${idx === 0 ? ' (Cover)' : ''}`,
                targetIndex: idx,
                subLabel: 'Halaman Tunggal',
                isActive: currentPageIndex === idx,
            }));
        }

        // In 2 Halaman (Buku) mode: list spreads
        const items = [
            {
                label: 'Halaman 1 (Sampul Depan)',
                targetIndex: 0,
                subLabel: 'Cover Depan (1 Halaman)',
                isActive: currentPageIndex === 0,
            },
        ];

        for (let i = 1; i < total; i += 2) {
            const leftPage = i + 1;
            const rightPage = i + 2;
            if (rightPage <= total) {
                items.push({
                    label: `Halaman ${leftPage} & ${rightPage}`,
                    targetIndex: i,
                    subLabel: 'Bentangan 2 Halaman',
                    isActive: currentPageIndex === i || currentPageIndex === i + 1,
                });
            } else {
                items.push({
                    label: `Halaman ${leftPage} (Sampul Belakang)`,
                    targetIndex: i,
                    subLabel: 'Halaman Terakhir (1 Halaman)',
                    isActive: currentPageIndex === i,
                });
            }
        }

        return items;
    };

    // Render page indicator text matching mode
    const renderPageIndicator = () => {
        if (!hasRealPdf) {
            if (isSingleMode) {
                return (
                    <>
                        Halaman Dokuhon Ke-{' '}
                        <span className="text-[#C51C2A] font-bold">
                            {currentPageIndex === 0 ? 'Sampul Depan' : currentPageIndex}
                        </span>{' '}
                        dari {pages.length + 1} Lembar (1 Halaman Tunggal)
                    </>
                );
            }
            if (isCover) {
                return (
                    <>
                        Sampul Depan •{' '}
                        <span className="text-[#C51C2A] font-bold">Cover Buku Dokuhon</span> (1 Halaman)
                    </>
                );
            }
            return (
                <>
                    Halaman Dokuhon Ke-{' '}
                    <span className="text-[#C51C2A] font-bold">
                        {currentPageIndex} (Genap/Kiri) & {currentPageIndex + 1} (Ganjil/Kanan)
                    </span>{' '}
                    dari {totalPageCount > 0 ? totalPageCount : pages.length + 1} Halaman (2 Halaman Buku)
                </>
            );
        }

        if (isSinglePageDocument) {
            return (
                <>
                    Dokumen PDF Asli •{' '}
                    <span className="text-[#C51C2A] font-bold">1 Halaman Tunggal</span>
                </>
            );
        }

        if (isSingleMode) {
            return (
                <>
                    Halaman Dokumen Ke-{' '}
                    <span className="text-[#C51C2A] font-bold">
                        {currentPageIndex + 1}
                    </span>{' '}
                    dari {pdfPages.length} Halaman PDF (1 Halaman Tunggal)
                </>
            );
        }

        // spreadMode === 'dual'
        if (currentPageIndex === 0) {
            return (
                <>
                    Halaman Dokumen Ke-{' '}
                    <span className="text-[#C51C2A] font-bold">1 (Sampul Depan)</span>{' '}
                    dari {pdfPages.length} Halaman PDF (1 Halaman)
                </>
            );
        }

        const leftPage = currentPageIndex + 1;
        const rightPage = currentPageIndex + 2;
        if (rightPage <= pdfPages.length) {
            return (
                <>
                    Halaman Dokumen Ke-{' '}
                    <span className="text-[#C51C2A] font-bold">
                        {leftPage} (Genap/Kiri) & {rightPage} (Ganjil/Kanan)
                    </span>{' '}
                    dari {pdfPages.length} Halaman PDF (2 Halaman Buku)
                </>
            );
        }

        return (
            <>
                Halaman Dokumen Ke-{' '}
                <span className="text-[#C51C2A] font-bold">
                    {leftPage} (Sampul Belakang)
                </span>{' '}
                dari {pdfPages.length} Halaman PDF (1 Halaman)
            </>
        );
    };

    return (
        <div
            ref={rootWrapperRef}
            className={cn(
                'relative flex flex-col rounded-2xl bg-white text-[#17202D] overflow-hidden shadow-xl border border-[#E8EBEF] select-none transition-all duration-300',
                isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : 'w-full',
                className
            )}
        >
            {/* Top Toolbar (Clean White Background) */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E8EBEF] z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#C51C2A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-xs md:text-sm font-bold text-[#102B40] tracking-wide truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                            {title}
                        </h2>
                        <p className="text-[10px] text-[#718092] font-medium">
                            {organization} • {hasRealPdf ? `Dokumen PDF Asli (${pdfPages.length} Halaman)` : 'Edisi Digital Dokuhon'}
                        </p>
                    </div>
                </div>

                {/* Toolbar Actions */}
                <div className="flex items-center gap-1.5 md:gap-2">
                    {/* View Switcher if PDF is present */}
                    {pdfUrl && (
                        <div className="flex items-center gap-1.5 mr-1">
                            {hasRealPdf && !isSinglePageDocument && (
                                <div className="hidden sm:inline-flex rounded-lg bg-[#F8F9FA] p-0.5 border border-[#E8EBEF] text-[11px]">
                                    <button
                                        type="button"
                                        onClick={() => setSpreadMode('single')}
                                        className={cn(
                                            'px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer',
                                            spreadMode === 'single'
                                                ? 'bg-[#102B40] text-white shadow-xs'
                                                : 'text-[#718092] hover:text-[#17202D]'
                                        )}
                                    >
                                        1 Halaman
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSpreadMode('dual')}
                                        className={cn(
                                            'px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer',
                                            spreadMode === 'dual'
                                                ? 'bg-[#102B40] text-white shadow-xs'
                                                : 'text-[#718092] hover:text-[#17202D]'
                                        )}
                                    >
                                        2 Halaman (Buku)
                                    </button>
                                </div>
                            )}

                            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-[#E8EBEF] text-[11px]">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('flipbook')}
                                    className={cn(
                                        'px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer',
                                        viewMode === 'flipbook'
                                            ? 'bg-[#C51C2A] text-white shadow-xs'
                                            : 'text-[#718092] hover:text-[#17202D]'
                                    )}
                                >
                                    {isSinglePageDocument ? 'Dokumen PDF Asli' : 'Flipbook 3D'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('pdf')}
                                    className={cn(
                                        'px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer',
                                        viewMode === 'pdf'
                                            ? 'bg-[#C51C2A] text-white shadow-xs'
                                            : 'text-[#718092] hover:text-[#17202D]'
                                    )}
                                >
                                    Viewer Asli
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Table of Contents Button */}
                    <button
                        type="button"
                        onClick={() => setShowToc(!showToc)}
                        title="Daftar Bab & Halaman"
                        className="p-1.5 rounded-lg text-[#718092] hover:text-[#17202D] hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <List className="w-4 h-4" />
                    </button>

                    {/* Sound Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                        title={isSoundEnabled ? 'Suara Kertas Aktif' : 'Suara Kertas Dibisukan'}
                        className="p-1.5 rounded-lg text-[#718092] hover:text-[#17202D] hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        {isSoundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                    </button>

                    {/* Zoom Toggle */}
                    <button
                        type="button"
                        onClick={() => {
                            setZoomLevel(zoomLevel === 100 ? 110 : 100);
                            setTimeout(() => pageFlipInstance.current?.update(), 150);
                        }}
                        title={zoomLevel === 100 ? 'Perbesar Halaman' : 'Ukuran Standar'}
                        className="hidden sm:inline-flex p-1.5 rounded-lg text-[#718092] hover:text-[#17202D] hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        {zoomLevel === 100 ? <ZoomIn className="w-4 h-4" /> : <ZoomOut className="w-4 h-4 text-amber-600" />}
                    </button>

                    {/* Direct PDF Download if available */}
                    {pdfUrl && (
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            download
                            title="Unduh File PDF Asli"
                            className="p-1.5 rounded-lg text-[#718092] hover:text-[#17202D] hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            <Download className="w-4 h-4" />
                        </a>
                    )}

                    {/* Fullscreen */}
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
                        className="p-1.5 rounded-lg text-[#718092] hover:text-[#17202D] hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Main Stage Canvas: Heyzine Studio Desk Surface (Viewport-fitted to eliminate vertical scroll) */}
            <div
                className="relative flex-1 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-[#F0F2F5] overflow-hidden"
                style={{ minHeight: `${singlePageH + 20}px` }}
            >
                {/* PDF Loading Indicator */}
                {isLoadingPdf && (
                    <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 z-30">
                        <Loader2 className="w-10 h-10 text-[#C51C2A] animate-spin" />
                        <h4 className="text-sm font-bold text-[#102B40]">
                            Sedang Merender Lembaran PDF Asli...
                        </h4>
                        <p className="text-xs text-[#718092] max-w-xs">
                            Mengonversi halaman dokumen yang diunggah ke tampilan Flipbook 3D resolusi tinggi.
                        </p>
                    </div>
                )}

                {pdfError && (
                    <div className="p-6 bg-red-50 text-red-700 rounded-xl text-center text-xs">
                        <p className="font-bold">Gagal memuat dokumen PDF</p>
                        <p className="mt-1">{pdfError}</p>
                    </div>
                )}

                {!isLoadingPdf && viewMode === 'pdf' && pdfUrl ? (
                    <div
                        className="w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-300 shadow-xl"
                        style={{ height: `${singlePageH}px` }}
                    >
                        <iframe
                            src={pdfUrl}
                            title="PDF Viewer"
                            className="w-full h-full border-0"
                        />
                    </div>
                ) : (
                    <div
                        className={cn(
                            'relative transition-all duration-300 ease-out flex items-center justify-center mx-auto',
                            isLoadingPdf ? 'hidden' : 'flex',
                            zoomLevel === 110 ? 'scale-105' : 'scale-100'
                        )}
                        style={{
                            width: `${spreadMode === 'dual' && !isSinglePageDocument ? spreadWidth : singlePageW}px`,
                            height: `${singlePageH}px`,
                            maxWidth: '100%',
                            maxHeight: `${singlePageH}px`,
                        }}
                    >
                        {/* Table of Contents Drawer */}
                        {showToc && (
                            <div className="absolute left-2 top-2 bottom-2 z-40 w-72 bg-white border border-[#E8EBEF] rounded-xl shadow-2xl p-4 flex flex-col">
                                <div className="flex items-center justify-between pb-3 border-b border-[#E8EBEF]">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#102B40] flex items-center gap-2">
                                        <List className="w-3.5 h-3.5 text-[#C51C2A]" />
                                        Daftar Halaman Dokumen
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setShowToc(false)}
                                        className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto py-2 space-y-1 pr-1 custom-scrollbar">
                                    {getTocItems().map((item, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => jumpToPage(item.targetIndex)}
                                            className={cn(
                                                'w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between',
                                                item.isActive ? 'bg-[#C51C2A] text-white' : 'text-[#334155] hover:bg-slate-100'
                                            )}
                                        >
                                            <span className="font-semibold truncate pr-2">
                                                {item.label}
                                            </span>
                                            {item.subLabel && (
                                                <span className="text-[10px] opacity-75 shrink-0">
                                                    {item.subLabel}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/*
                            Unified Mount point for PageFlip DOM elements:
                            - In dual mode, Page 0 (Cover) is on the right half.
                              Applying translateX(-25%) shifts the book so Page 0 sits right in the horizontal center!
                            - On inside pages (Pages 2 & 3): translateX(0) shows both pages side-by-side!
                            - On Back Cover (even total): translateX(25%) shifts the left half into the center!
                            - In single mode: translateX(0) shows 1 page in the center!
                        */}
                        <div
                            ref={bookMountRef}
                            className="relative w-full h-full flex items-center justify-center transition-transform duration-500 ease-out"
                            style={{
                                transform: mountTranslateX !== '0%' ? `translateX(${mountTranslateX})` : 'none',
                            }}
                        />
                    </div>
                )}

                {/* Floating Left & Right Flip Buttons (Hidden for 1-page document) */}
                {!isSinglePageDocument && (
                    <>
                        <button
                            type="button"
                            onClick={handlePrev}
                            disabled={currentPageIndex === 0}
                            title="Geser / Balik Halaman Sebelumnya"
                            className={cn(
                                'absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white text-[#102B40] border border-[#E8EBEF] shadow-lg hover:bg-[#C51C2A] hover:text-white hover:scale-105 cursor-pointer shadow-xl transition-all',
                                currentPageIndex === 0 && 'opacity-30 cursor-not-allowed pointer-events-none'
                            )}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={currentPageIndex >= totalEffectivePages - 1}
                            title="Geser / Balik Halaman Selanjutnya"
                            className={cn(
                                'absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white text-[#102B40] border border-[#E8EBEF] shadow-lg hover:bg-[#C51C2A] hover:text-white hover:scale-105 cursor-pointer shadow-xl transition-all',
                                currentPageIndex >= totalEffectivePages - 1 && 'opacity-30 cursor-not-allowed pointer-events-none'
                            )}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>

            {/* Bottom Controls Bar (Clean White Background) */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white border-t border-[#E8EBEF] text-xs text-[#718092] z-20 shrink-0">
                {/* Jump to first / prev */}
                <div className="flex items-center gap-1">
                    {!isSinglePageDocument && (
                        <>
                            <button
                                type="button"
                                onClick={() => jumpToPage(0)}
                                title="Halaman Pertama / Cover"
                                className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                                <ChevronsLeft className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handlePrev}
                                title="Halaman Sebelumnya"
                                className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>

                {/* Page Indicator */}
                <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-[#102B40]">
                        {renderPageIndicator()}
                    </span>
                    {!isSinglePageDocument && (
                        <span className="text-slate-400 hidden sm:inline">
                            {isSingleMode
                                ? '(Dapat ditarik / digeser sudut halamannya)'
                                : isCover
                                    ? '(Klik tombol panah kanan untuk membuka buku)'
                                    : '(Dapat ditarik / digeser sudut halamannya)'}
                        </span>
                    )}
                </div>

                {/* Jump to next / last */}
                <div className="flex items-center gap-1">
                    {!isSinglePageDocument && (
                        <>
                            <button
                                type="button"
                                onClick={handleNext}
                                title="Halaman Berikutnya"
                                className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => jumpToPage(totalEffectivePages - 1)}
                                title="Halaman Terakhir"
                                className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                                <ChevronsRight className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Hidden Source Template for Dokuhon HTML pages (cloned by PageFlip without touching React's DOM tree) */}
            {!hasRealPdf && (
                <div ref={sourceTemplateRef} className="hidden" aria-hidden="true">
                    {/* Cover */}
                    <div className="flipbook-page-item page-cover" data-density="hard">
                        <div className="relative w-full h-full rounded-r-xl bg-gradient-to-br from-[#102B40] via-[#0c1e2d] to-[#081520] border-4 border-[#D97706]/40 p-8 shadow-2xl flex flex-col justify-between overflow-hidden select-none">
                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/50 via-black/10 to-transparent pointer-events-none rounded-l-lg border-r border-[#D97706]/20" />

                            <div className="text-center space-y-2 z-10">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0B132B] border-2 border-[#D97706] text-[#D97706] shadow-md mx-auto mb-2">
                                    <span className="font-serif text-2xl font-bold">拳</span>
                                </div>
                                <p className="text-[11px] font-bold tracking-widest text-[#D97706] uppercase">
                                    Persaudaraan Bela Diri Kempo Indonesia
                                </p>
                                <h1 className="text-2xl md:text-3xl font-serif font-black text-white tracking-tight">
                                    {title}
                                </h1>
                                <div className="w-16 h-0.5 bg-[#C51C2A] mx-auto my-3" />
                                <p className="text-xs text-slate-300 font-medium">
                                    {subtitle}
                                </p>
                            </div>

                            <div className="my-auto py-4 text-center space-y-3 z-10">
                                <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-amber-300">
                                    力愛不二 • 拳禅一如 • 剛柔一体
                                </div>
                                <p className="text-xs text-slate-400 italic max-w-xs mx-auto leading-relaxed">
                                    "Kasih sayang tanpa kekuatan adalah kelemahan, kekuatan tanpa kasih sayang adalah kezaliman."
                                </p>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300 z-10">
                                <span className="font-semibold">{organization}</span>
                                <span className="inline-flex items-center gap-1.5 text-[#D97706] font-bold">
                                    Geser untuk Buka Buku <ChevronRight className="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content Pages */}
                    {pages.map((p, idx) => (
                        <div
                            key={idx}
                            className="flipbook-page-item"
                            data-density="soft"
                        >
                            <div
                                className={cn(
                                    'w-full h-full relative flex flex-col justify-between px-5 py-4 sm:px-6 sm:py-5 text-[#1E293B] overflow-hidden select-none',
                                    p.is_even
                                        ? 'bg-gradient-to-r from-[#F4F3EE] via-[#FAF9F5] to-[#FAF9F5] rounded-l-xs shadow-[-6px_10px_24px_-4px_rgba(0,0,0,0.14)]'
                                        : 'bg-gradient-to-l from-[#F4F3EE] via-[#FAF9F5] to-[#FAF9F5] rounded-r-xs shadow-[6px_10px_24px_-4px_rgba(0,0,0,0.14)]'
                                )}
                            >
                                {/* Heyzine photorealistic gutter overlay for authentic spine curvature */}
                                {p.is_even ? (
                                    <div className="absolute inset-y-0 right-0 w-11 pointer-events-none z-10" style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.06) 28%, rgba(0,0,0,0.02) 65%, transparent 100%)' }} />
                                ) : (
                                    <div className="absolute inset-y-0 left-0 w-11 pointer-events-none z-10" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.06) 28%, rgba(0,0,0,0.02) 65%, transparent 100%)' }} />
                                )}
                                {/* Running Header */}
                                <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] text-[11px] text-[#718092] shrink-0">
                                    {p.is_even ? (
                                        <>
                                            <span className="font-semibold uppercase tracking-wider font-mono text-[#C51C2A]">
                                                {p.japanese_term || 'Shorinji Kempo'}
                                            </span>
                                            <span className="font-bold text-[#102B40] truncate max-w-[180px]">
                                                {title}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="font-bold text-[#102B40] truncate max-w-[180px]">
                                                {p.title}
                                            </span>
                                            <span className="font-semibold uppercase tracking-wider font-mono text-[#C51C2A]">
                                                {p.japanese_term || 'Dokuhon Perkemi'}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Page Body: Topic Subtitle, Numbered Paragraphs, Callout */}
                                <div className="py-2 flex-1 flex flex-col justify-between overflow-hidden">
                                    <div className="pt-0.5 pb-1">
                                        <h3 className="text-xs sm:text-[13px] font-bold text-[#D97706] tracking-tight leading-snug">
                                            {p.subtitle || p.title}
                                        </h3>
                                    </div>

                                    <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-[11.5px] leading-relaxed text-[#334155] my-auto">
                                        {Array.isArray(p.content) ? (
                                            p.content.map((paragraph, pIdx) => (
                                                <p key={pIdx} className="text-justify leading-relaxed">
                                                    {paragraph}
                                                </p>
                                            ))
                                        ) : (
                                            <p className="text-justify leading-relaxed">{p.content}</p>
                                        )}
                                    </div>

                                    {p.callout && (
                                        <div className="mt-2.5 p-3 sm:p-3.5 rounded-xl bg-[#FAF6EE] border-l-4 border-[#C51C2A] text-[10.5px] sm:text-[11px] font-medium text-[#1E293B] italic leading-relaxed shrink-0 shadow-2xs">
                                            "{p.callout}"
                                        </div>
                                    )}
                                </div>

                                {/* Running Footer */}
                                <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#718092] shrink-0">
                                    {p.is_even ? (
                                        <>
                                            <span className="font-bold font-mono text-[#102B40] flex items-center gap-1.5">
                                                <span className="w-5 h-5 rounded-full bg-[#102B40] text-white flex items-center justify-center text-[10px] font-bold">
                                                    {p.page_number}
                                                </span>
                                                <span>• Hal. Genap</span>
                                            </span>
                                            <span className="text-[10px] sm:text-[10.5px] italic text-[#718092]">
                                                {p.footer_note || organization}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-[10px] sm:text-[10.5px] italic text-[#718092]">
                                                {p.footer_note || organization}
                                            </span>
                                            <span className="font-bold font-mono text-[#C51C2A] flex items-center gap-1.5">
                                                <span>Hal. Ganjil •</span>
                                                <span className="w-5 h-5 rounded-full bg-[#C51C2A] text-white flex items-center justify-center text-[10px] font-bold">
                                                    {p.page_number}
                                                </span>
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Export wrapped in ErrorBoundary
export const FlipbookViewer: React.FC<FlipbookViewerProps> = (props) => {
    return (
        <FlipbookErrorBoundary>
            <FlipbookViewerInternal {...props} />
        </FlipbookErrorBoundary>
    );
};
