<?php

declare(strict_types=1);

namespace App\Services;

class DokuhonPageService
{
    /**
     * Get official Perkemi Dokuhon pages formatted for interactive odd/even book spreads.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function getDefaultPages(string $title = 'Dokuhon Shorinji Kempo', ?string $summary = null): array
    {
        return [
            [
                'page_number' => 1,
                'is_even' => false,
                'type' => 'intro',
                'title' => 'Kata Pengantar PB PERKEMI',
                'subtitle' => 'Pusat Komando Persaudaraan Bela Diri Kempo Indonesia',
                'japanese_term' => '拳禅一如 (Ken Zen Ichi Nyo)',
                'content' => [
                    'Shorinji Kempo bukan sekadar seni bela diri fisik untuk memenangkan pertarungan, melainkan disiplin pembinaan mental (Gyo) yang memadukan latihan raga dan ketenangan jiwa.',
                    'Diciptakan oleh So Doshin pada tahun 1947 di Tadotsu, Jepang, dan dikembangkan di Indonesia oleh PB PERKEMI sejak tahun 1966 dengan prinsip persaudaraan sejati antar Kenshi tanpa memandang suku, agama, dan latar belakang.',
                    'Dokuhon ini wajib dipelajari dan dihayati oleh seluruh Kenshi di dojo seluruh Nusantara sebagai panduan moral sebelum melangkah ke ujian kenaikan tingkat (UKT).',
                ],
                'callout' => 'Latihan fisik tanpa falsafah rohani hanyalah kekerasan tanpa arah.',
                'footer_note' => 'Dokumen Pedoman Resmi PB PERKEMI - Hak Cipta Dilindungi',
            ],
            [
                'page_number' => 2,
                'is_even' => true,
                'type' => 'pledge',
                'title' => 'Janji Kenshi Indonesia',
                'subtitle' => 'Kenshi no Seishin - Ikrar Kesetiaan & Moral',
                'japanese_term' => '誓詞 (Seishi)',
                'content' => [
                    '1. Kami berjanji akan menjunjung tinggi nama baik dan kehormatan Persaudaraan Bela Diri Kempo Indonesia (PERKEMI).',
                    '2. Kami berjanji akan menghormati orang tua, guru, dan para sesepuh, serta mengasihi sesama saudara seperguruan.',
                    '3. Kami berjanji akan selalu bertindak jujur, rendah hati, berani membela kebenaran, dan menjauhi perbuatan tercela.',
                    '4. Kami berjanji akan menggunakan ilmu Shorinji Kempo semata-mata untuk membela diri dan menolong sesama yang lemah.',
                    '5. Kami berjanji tidak akan menyalahgunakan ilmu bela diri untuk kesombongan pribadi atau mencelakai orang lain.',
                ],
                'callout' => 'Ikrar diucapkan dengan sikap Gassho Rei sebelum dan sesudah latihan.',
                'footer_note' => 'Bagian I: Etika & Sumpah Kenshi Tatami',
            ],
            [
                'page_number' => 3,
                'is_even' => false,
                'type' => 'philosophy',
                'title' => 'Sejohun: Kebenaran Abadi',
                'subtitle' => 'Pilar Filosofis Pembentukan Karakter Kenshi',
                'japanese_term' => '聖句 (Seiku)',
                'content' => [
                    '"Engkau adalah tuan bagi dirimu sendiri. Siapa lagi yang dapat menjadi tuan bagimu? Bila dirimu telah terkendali dengan baik, engkau akan memperoleh kekuatan perlindungan yang sukar dicari bandingannya."',
                    'Kutipan dari ajaran kuno ini menegaskan bahwa musuh terbesar manusia bukanlah lawan di arena tatami, melainkan ego, nafsu, dan kelemahan disiplin di dalam batin diri sendiri.',
                    'Dengan menaklukkan diri sendiri melalui latihan Chinkon Gyo dan repetisi teknik waza, seorang Kenshi memperoleh kemandirian sejati (Jiko Kakuritsu).',
                ],
                'callout' => 'Taklukkan dirimu sendiri sebelum engkau mencoba membimbing orang lain.',
                'footer_note' => 'Sejohun Ayat 1-3 • Dokuhon Resmi PB Perkemi',
            ],
            [
                'page_number' => 4,
                'is_even' => true,
                'type' => 'pledge',
                'title' => 'Shinjo: Sumpah Kehidupan',
                'subtitle' => 'Pedoman Aksi Nyata dalam Masyarakat',
                'japanese_term' => '信条 (Shinjo)',
                'content' => [
                    'Kami bersyukur telah dianugerahi jiwa dan raga yang utuh untuk mengabdi kepada kemanusiaan.',
                    'Kami mencintai tanah air Indonesia, menghormati persaudaraan, dan berikrar untuk menyumbangkan tenaga serta pikiran bagi perdamaian dunia.',
                    'Kami menolak segala bentuk tirani dan ketidakadilan, serta bertekad menciptakan keharmonisan sosial di lingkungan keluarga, dojo, dan bangsa.',
                ],
                'callout' => 'Kenshi sejati dinilai dari kontribusi kebaikannya di tengah masyarakat.',
                'footer_note' => 'Bagian II: Falsafah Sosial Kempo',
            ],
            [
                'page_number' => 5,
                'is_even' => false,
                'type' => 'principle',
                'title' => 'Riki Ai Funi',
                'subtitle' => 'Kekuatan dan Kasih Sayang Tidak Terpisahkan',
                'japanese_term' => '力愛不二 (Riki Ai Funi)',
                'content' => [
                    'Salah satu ajaran paling mendasar dalam Shorinji Kempo adalah integrasi antara Cinta Kasih (Ai) dan Kekuatan (Riki).',
                    '"Kasih sayang tanpa kekuatan adalah kelemahan (tidak mampu menolong mereka yang tertindas). Kekuatan tanpa kasih sayang adalah kezaliman (berubah menjadi penindasan dan kebrutalan)."',
                    'Oleh karena itu, setiap kenshi dilatih memiliki ketangkasan fisik yang prima agar sanggup membela keadilan, seraya menyucikan hati agar kekuatannya selalu dipandu oleh welas asih.',
                ],
                'callout' => 'Riki (Kekuatan) + Ai (Kasih Sayang) = Funi (Satu Kesatuan Tak Terpisahkan).',
                'footer_note' => 'Pilar Kempo #1 • Filosofi Utama Shorinji Kempo',
            ],
            [
                'page_number' => 6,
                'is_even' => true,
                'type' => 'technique',
                'title' => 'Goju Ittai',
                'subtitle' => 'Keseimbangan Teknik Keras (Goho) & Lunak (Juho)',
                'japanese_term' => '剛柔一体 (Goju Ittai)',
                'content' => [
                    'Teknik Shorinji Kempo tersusun atas dua cabang besar yang saling melengkapi bagaikan dua sisi mata uang:',
                    '1. GOHO WAZA (Teknik Keras): Meliputi pukulan (Tsuki), tendangan (Geri), tangkisan (Uke), dan sikutan (Uchi) yang mengandalkan kecepatan, timing, dan kime tepat sasaran.',
                    '2. JUHO WAZA (Teknik Lunak): Meliputi pelepasan cengkeraman (Nuki), kuncian pergelangan (Gote), pelintiran (Maki), dan bantingan (Nage) yang memanfaatkan tenaga lawan secara anatomis tanpa perlu otot besar.',
                ],
                'callout' => 'Lawan yang keras dihadapi dengan lembut; lawan yang lembut dikendalikan dengan tegas.',
                'footer_note' => 'Pilar Kempo #2 • Kurikulum Teknik Tatami',
            ],
            [
                'page_number' => 7,
                'is_even' => false,
                'type' => 'technique',
                'title' => 'Syusho Komyo',
                'subtitle' => 'Pertahanan Sebagai Inti Penyerangan Balik',
                'japanese_term' => '守主攻従 (Syusho Komyo)',
                'content' => [
                    'Dalam Shorinji Kempo, "Pertahanan adalah Pokok, Penyerangan adalah Akibat". Seorang Kenshi tidak pernah memulai serangan pertama (Kempo Ni Sente Nashi).',
                    'Gerakan awal selalu berupa tangkisan (Uke) atau penghindaran tubuh (Tai Sabaki / Tenshin). Serangan balasan baru dilancarkan segera setelah serangan lawan dinetralkan.',
                    'Prinsip ini menjaga kenshi tetap berada di pihak moral yang benar dalam situasi hukum maupun tatami pertahanan diri.',
                ],
                'callout' => 'Kempo Ni Sente Nashi: Jangan pernah mengambil inisiatif menyerang lebih dahulu.',
                'footer_note' => 'Pilar Kempo #3 • Strategi Pertarungan Kumite',
            ],
            [
                'page_number' => 8,
                'is_even' => true,
                'type' => 'anatomy',
                'title' => 'Anatomi Titik Rentan (Kyusho)',
                'subtitle' => 'Pengetahuan Ilmiah Titik Kelemahan Tubuh Manusia',
                'japanese_term' => '急所 (Kyusho Waza)',
                'content' => [
                    'Shorinji Kempo tidak mengandalkan benturan kekuatan fisik kasar. Efektivitas teknik bertumpu pada presisi serangan ke 138 titik rentan anatomis (Kyusho):',
                    '• Suigetsu (Ulu Hati): Menghentikan aliran napas dan mengganggu diafragma lawan seketika.',
                    '• Dokko (Bawah Telinga): Menekan saraf cranial untuk melepaskan cengkeraman leher.',
                    '• Kinteki (Selangkangan / Kemaluan): Titik terlarang dalam pertandingan olahraga namun vital untuk bela diri bertahan hidup.',
                    '• Kote (Pergelangan Tangan): Sambungan sendi radius dan ulna tempat aplikasi kuncian Kote Nuki dan Maki Gote.',
                ],
                'callout' => 'PERINGATAN: Titik Kyusho hanya boleh dipraktikkan di bawah pengawasan langsung Sensei.',
                'footer_note' => 'Bagian Anatomi Biomedis Shorinji Kempo',
            ],
            [
                'page_number' => 9,
                'is_even' => false,
                'type' => 'etiquette',
                'title' => 'Tata Krama & Etika Dojo (Reigi)',
                'subtitle' => 'Disiplin Tatami, Kebersihan, dan Rasa Hormat',
                'japanese_term' => '礼儀作法 (Reigi Sahou)',
                'content' => [
                    'Dojo adalah tempat suci penempaan jiwa. Setiap Kenshi wajib menjaga kesucian tempat latihan dengan mentaati aturan baku:',
                    '1. Gassho Rei: Membungkuk dengan kedua telapak tangan menyatu di depan dada setinggi hidung, pandangan tetap lurus menatap mata saudara seperguruan.',
                    '2. Samu: Tradisi membersihkan tatami bersama sebelum dan sesudah latihan guna menekan keangkuhan ego.',
                    '3. Dogi yang Rapi: Pakaian latihan putih bersih dengan lambang PERKEMI di dada kiri dan sabuk terikat simpul rapi.',
                ],
                'callout' => 'Dimulai dengan rasa hormat (Rei), diakhiri dengan rasa hormat.',
                'footer_note' => 'Pedoman Kehidupan Tradisi Dojo Kempo',
            ],
            [
                'page_number' => 10,
                'is_even' => true,
                'type' => 'summary',
                'title' => 'Standar Evaluasi Kenaikan Tingkat (UKT)',
                'subtitle' => 'Daftar Uji Kemahiran Mudansha & Yudansha PB PERKEMI',
                'japanese_term' => '昇級・昇段審査 (Shinsa)',
                'content' => [
                    'Penilaian ujian kenaikan tingkat Shorinji Kempo terbagi dalam tiga aspek mutlak:',
                    'A. Falsafah Dokuhon (Lisan & Tulisan): Penguasaan Sejohun, Shinjo, Janji Kenshi, dan sejarah berdirinya PERKEMI.',
                    'B. Waza Teknik (Kihon, Goho, Juho): Akurasi kuda-kuda (Kamae), kime pukulan, putaran sendi pada kuncian, dan jatuhan ukemi yang aman.',
                    'C. Embu & Randori: Sinkronisasi pasangan kumi embu beregu dan ketahanan fisik dalam latihan bertarung terkontrol (boguyagyu).',
                ],
                'callout' => 'Sabuk hitam (Yudansha) bukanlah akhir, melainkan awal gerbang pembelajaran sesungguhnya.',
                'footer_note' => 'Lembar Pengesahan Dewan Guru PB PERKEMI 2026',
            ],
        ];
    }
}
