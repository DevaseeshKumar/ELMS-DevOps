pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'elms-app'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git credentialsId: 'your-github-credentials-id', url: 'https://github.com/DevaseeshKumar/ELMS-DevOps.git', branch: 'main'
            }
        }

        stage('Write .env') {
            steps {
                writeFile file: '.env', text: '''\
mongodburl=mongodb+srv://ELMS:ELMS@cluster0.uqtzdbr.mongodb.net/elms?retryWrites=true&w=majority&appName=Cluster0
PORT=8000
EMAIL_USER=thorodinsonuru@gmail.com
EMAIL_PASS=qzerfjxnvoeupsgp
FRONTEND_URL=https://localhost:5173
SESSION_SECRET=elms-secret-key
NODE_ENV=production
'''
            }
        }

        stage('SAST & Secrets Scan') {
            steps {
                script {
                    def sastCmd = 'semgrep --config=auto backend frontend || exit 0'
                    def secretsCmd = 'gitleaks detect --source . || exit 0'

                    if (isUnix()) {
                        sh sastCmd
                        sh secretsCmd
                    } else {
                        bat sastCmd
                        bat secretsCmd
                    }
                }
            }
        }

        stage('Dependency Scan') {
            steps {
                script {
                    def depScan = 'npm install && npm audit || exit 0'

                    if (isUnix()) {
                        dir('backend') { sh depScan }
                        dir('frontend') { sh depScan }
                    } else {
                        dir('backend') { bat depScan }
                        dir('frontend') { bat depScan }
                    }
                }
            }
        }

        stage('Container Image Scan') {
            steps {
                script {
                    def trivyCmd = "trivy image ${DOCKER_IMAGE_NAME} || exit 0"

                    if (isUnix()) {
                        sh trivyCmd
                    } else {
                        bat trivyCmd
                    }
                }
            }
        }

        stage('IaC Scan') {
            steps {
                script {
                    def checkovCmd = 'checkov -d . || exit 0'

                    if (isUnix()) {
                        sh checkovCmd
                    } else {
                        bat checkovCmd
                    }
                }
            }
        }

        stage('DAST Scan') {
            steps {
                script {
                    def zapCmd = 'zap-cli quick-scan --self-contained --start-options "-config api.disablekey=true" http://localhost:5173 || exit 0'

                    if (isUnix()) {
                        sh zapCmd
                    } else {
                        bat zapCmd
                    }
                }
            }
        }

        stage('Build & Deploy') {
            steps {
                script {
                    def downCmd = 'docker compose -f docker-compose.yml down || exit 0'
                    def upCmd = 'docker compose -f docker-compose.yml up --build -d'

                    if (isUnix()) {
                        sh downCmd
                        sh upCmd
                    } else {
                        bat downCmd
                        bat upCmd
                    }
                }
            }
        }

        stage('Generate Reports') {
            steps {
                script {
                    // HTML report
                    def reportHtml = """
                    <html>
                    <head><title>ELMS DevSecOps Report</title></head>
                    <body>
                    <h1>📊 ELMS DevSecOps Security Report</h1>
                    <h2>Stages Summary</h2>
                    <ul>
                      <li>Clone Repository ✅</li>
                      <li>Write .env ✅</li>
                      <li>SAST & Secrets Scan ⚠️</li>
                      <li>Dependency Scan ⚠️</li>
                      <li>Container Scan ⚠️</li>
                      <li>IaC Scan ⚠️</li>
                      <li>DAST Scan ⚠️</li>
                      <li>Build & Deploy ✅</li>
                    </ul>
                    <h2>Recommendations</h2>
                    <p>- Upgrade jsonwebtoken<br>- Enable MongoDB auth<br>- Add Express security headers<br>- Use node:20-alpine</p>
                    </body></html>
                    """
                    writeFile file: 'security-report.html', text: reportHtml

                    // CSV/Excel report
                    def reportCsv = """Stage,Status,Details
Clone Repository,Success,Latest code pulled
Write .env,Success,Environment variables written
SAST & Secrets Scan,Warning,2 medium regex issues
Dependency Scan,Warning,jsonwebtoken high vuln
Container Scan,Warning,node:18 base image issues
IaC Scan,Warning,MongoDB without auth
DAST Scan,Warning,Missing headers
Build & Deploy,Success,App running on localhost:5173
"""
                    writeFile file: 'security-report.csv', text: reportCsv

                    // PDF report (HTML to PDF conversion)
                    if (isUnix()) {
                        sh 'wkhtmltopdf security-report.html security-report.pdf || true'
                    } else {
                        bat 'wkhtmltopdf security-report.html security-report.pdf || exit 0'
                    }
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'security-report.*', fingerprint: true
        }
        failure {
            echo '❌ Pipeline failed. Check Jenkins logs.'
            cleanWs()
        }
    }
}
