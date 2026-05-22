-- ================================================================
-- TEMIZLE ve YENİDEN OLUŞTUR
-- ================================================================
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS job_alerts CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;

-- Jobs Table (tüm sütunlarla)
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Türkiye',
    position VARCHAR(100) NOT NULL,
    work_type VARCHAR(50) DEFAULT 'Tam Zamanlı',
    description TEXT NOT NULL,
    requirements TEXT,
    applications_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications Table
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_email VARCHAR(255),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, user_id)
);

-- Job Alerts Table
CREATE TABLE job_alerts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    user_email VARCHAR(255),
    keyword VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    work_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Başvuru sayısını artıran fonksiyon
CREATE OR REPLACE FUNCTION increment_applications(job_id INT)
RETURNS void AS $$
BEGIN
  UPDATE jobs SET applications_count = applications_count + 1 WHERE id = job_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- SEED DATA — 15 gerçek Türk iş ilanı
-- ================================================================
INSERT INTO jobs (title, company_name, city, country, position, work_type, description, requirements, applications_count) VALUES
('Frontend Developer (React)', 'Trendyol', 'İstanbul', 'Türkiye', 'Frontend Developer', 'Hibrit',
 'Trendyol bünyesinde milyonlarca kullanıcıya hitap eden ticari uygulamaların frontend geliştirme süreçlerinde görev alacak yetenekli Frontend Developer arıyoruz. React ekosisteminde deneyimli, performans odaklı kod yazmayı seven biriyle çalışmak istiyoruz.',
 'React, TypeScript, Redux, REST API, Git | En az 3 yıl deneyim', 127),

('Backend Developer (Node.js)', 'Hepsiburada', 'İstanbul', 'Türkiye', 'Backend Developer', 'Uzaktan',
 'Hepsiburada ekosisteminin büyümesine katkı sağlayacak, Node.js konusunda uzmanlaşmış bir Backend Developer arıyoruz. Yüksek trafikli sistemler tasarlama ve geliştirme konusunda tecrübeniz olmalıdır.',
 'Node.js, Express, PostgreSQL, Redis, Docker | En az 4 yıl deneyim', 89),

('Yazılım Uzmanı', 'Logo Yazılım', 'İzmir', 'Türkiye', 'Yazılım Uzmanı', 'Tam Zamanlı',
 'Logo Yazılım İzmir ofisimizde görev yapacak, kurumsal yazılım projelerinde aktif rol üstlenecek Yazılım Uzmanı arıyoruz.',
 '.NET, C#, SQL Server, REST API | Üniversite mezunu | En az 2 yıl deneyim', 45),

('Full Stack Developer', 'Insider', 'İstanbul', 'Türkiye', 'Full Stack Developer', 'Hibrit',
 'Insider olarak dünya genelinde 1200+ markaya hizmet eden SaaS platformumuza katkı sağlayacak Full Stack Developer arıyoruz.',
 'React, Node.js, PostgreSQL, Docker, AWS | En az 3 yıl full stack deneyim', 203),

('Mobile Developer (React Native)', 'Getir', 'İstanbul', 'Türkiye', 'Mobile Developer', 'Tam Zamanlı',
 'Getir uygulamasını kullanan milyonlarca kullanıcı için harika mobil deneyimler yaratacak React Native geliştirici arıyoruz.',
 'React Native, JavaScript, Redux, iOS/Android | En az 2 yıl mobil geliştirme deneyimi', 156),

('DevOps Engineer', 'Turkcell', 'İstanbul', 'Türkiye', 'DevOps Engineer', 'Tam Zamanlı',
 'Turkcell altyapı ekibinde görev yapacak, CI/CD pipeline yönetimi ve bulut altyapısı konusunda deneyimli DevOps Engineer arıyoruz.',
 'Docker, Kubernetes, Jenkins, AWS/Azure, Linux | En az 4 yıl DevOps deneyimi', 67),

('UI/UX Tasarımcı', 'Yemeksepeti', 'İstanbul', 'Türkiye', 'UI/UX Designer', 'Hibrit',
 'Kullanıcı merkezli tasarım yaklaşımıyla Yemeksepeti uygulamasının deneyimini bir üst seviyeye taşıyacak UI/UX Tasarımcı arıyoruz.',
 'Figma, Adobe XD, Kullanıcı araştırması, Prototipleme | En az 3 yıl UX deneyimi', 94),

('Data Scientist', 'Akbank', 'İstanbul', 'Türkiye', 'Data Scientist', 'Hibrit',
 'Akbankin veri analitiği ekibinde yer alacak, makine öğrenmesi modelleri geliştirip üretim ortamına alacak bir Data Scientist arıyoruz.',
 'Python, Machine Learning, SQL, TensorFlow/PyTorch | En az 3 yıl deneyim', 78),

('Junior Frontend Developer', 'Paraşüt', 'İzmir', 'Türkiye', 'Frontend Developer', 'Uzaktan',
 'İzmir merkezli SaaS fintech girişimimiz Parasütte kariyer yolculuğunun başında olan, öğrenmeye açık Junior Frontend Developer arıyoruz.',
 'JavaScript, Vue.js veya React, HTML, CSS | Yeni mezun veya 1 yıl deneyim kabul edilir', 112),

('Backend Developer (Python)', 'Peak Games', 'İstanbul', 'Türkiye', 'Backend Developer', 'Hibrit',
 'Dünya genelinde yüz milyonlarca oyuncuya hitap eden oyun altyapımızı büyütecek Python Backend Developer arıyoruz.',
 'Python, Django/FastAPI, PostgreSQL, Redis, Celery | En az 3 yıl deneyim', 88),

('Yazılım Geliştirici (.NET)', 'ING Bank', 'İstanbul', 'Türkiye', 'Yazılım Geliştirici', 'Hibrit',
 'ING Bank Türkiye dijital dönüşüm ekibinde görev yapacak, .NET teknolojilerinde uzman Yazılım Geliştirici arıyoruz.',
 '.NET Core, C#, SQL Server, Microservices | En az 3 yıl deneyim', 52),

('Cloud Engineer', 'Softtech', 'İstanbul', 'Türkiye', 'Cloud Engineer', 'Uzaktan',
 'İş Bankasının teknoloji iştiraki Softtechte bulut altyapısı projeleri yürütecek Cloud Engineer arıyoruz.',
 'AWS/Azure, Terraform, Kubernetes, CI/CD | En az 4 yıl bulut deneyimi', 43),

('Android Developer', 'Sahibinden.com', 'İstanbul', 'Türkiye', 'Mobile Developer', 'Hibrit',
 'Türkiyenin en büyük ilan platformu Sahibinden.comda Android uygulamasının geliştirilmesinde aktif rol üstlenecek Android Developer arıyoruz.',
 'Kotlin, Android SDK, MVVM, REST API | En az 2 yıl Android deneyimi', 71),

('Frontend Developer (Vue.js)', 'Vodafone Türkiye', 'İstanbul', 'Türkiye', 'Frontend Developer', 'Hibrit',
 'Vodafone Türkiye dijital ürünleri ekibinde çalışacak, Vue.js konusunda uzman Frontend Developer arıyoruz.',
 'Vue.js, TypeScript, Vuex, REST API | En az 3 yıl Vue deneyimi', 66),

('QA Engineer', 'Enpara', 'Ankara', 'Türkiye', 'QA Engineer', 'Tam Zamanlı',
 'Dijital bankacılık ürünlerimizin kalitesini güvence altına alacak, test otomasyonu konusunda deneyimli QA Engineer arıyoruz.',
 'Selenium, Cypress, API Testing, Agile | En az 2 yıl test deneyimi', 29);

-- ================================================================
-- SEARCH HISTORY
-- ================================================================
CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    position VARCHAR(255),
    city VARCHAR(100),
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
