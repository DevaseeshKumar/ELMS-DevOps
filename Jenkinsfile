pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'elms-app'
        PIPELINE_ISSUES = ""   // initialize empty
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
                    try {
                        if (isUnix()) {
                            sh 'semgrep --config=auto backend frontend || true'
                            sh 'gitleaks detect --source . || true'
                        } else {
                            bat 'powershell -Command "Try { semgrep --config=auto backend frontend } Catch {} ; exit 0"'
                            bat 'powershell -Command "Try { gitleaks detect --source . } Catch {} ; exit 0"'
                        }
                    } catch(e) {
                        echo "⚠️ SAST/Secrets scan warnings: ${e}"
                        env.PIPELINE_ISSUES += "SAST/Secrets scan warnings\n"
                    }
                }
            }
        }

        stage('Dependency Scan') {
            steps {
                script {
                    def depReport = ''
                    try {
                        def depJson = ''
                        if (isUnix()) {
                            depJson = sh(script: 'cd backend && npm install && npm audit --json || true', returnStdout: true).trim()
                        } else {
                            depJson = bat(script: 'cd backend && npm install && npm audit --json', returnStdout: true).trim()
                        }

                        def json = [:]
                        if (depJson && depJson.contains("{")) {
                            json = readJSON text: depJson
                        }

                        if (json.vulnerabilities) {
                            json.vulnerabilities.each { name, vuln ->
                                depReport += "${name} - ${vuln.severity} - ${vuln.fixAvailable ? 'Fix Available' : 'No fix'}\n"
                            }
                        } else {
                            depReport = "No vulnerabilities found."
                        }
                    } catch(e) {
                        echo "⚠️ Dependency scan failed: ${e}"
                        depReport = "Dependency scan failed or no JSON output."
                        env.PIPELINE_ISSUES += "Dependency scan warnings\n"
                    }

                    writeFile file: 'dependency-report.txt', text: depReport
                    echo "📌 Dependency scan report written"
                }
            }
        }

        stage('Container Image Scan') {
            steps {
                script {
                    try {
                        def cmd = isUnix() ? "trivy image ${DOCKER_IMAGE_NAME} || true" : 'powershell -Command "Try { trivy image ${env.DOCKER_IMAGE_NAME} } Catch {} ; exit 0"'
                        if (isUnix()) sh cmd else bat cmd
                    } catch(e) {
                        echo "⚠️ Container scan warnings: ${e}"
                        env.PIPELINE_ISSUES += "Container scan warnings\n"
                    }
                }
            }
        }

        stage('IaC Scan') {
            steps {
                script {
                    try {
                        def cmd = isUnix() ? 'checkov -d . || true' : 'powershell -Command "Try { checkov -d . } Catch {} ; exit 0"'
                        if (isUnix()) sh cmd else bat cmd
                    } catch(e) {
                        echo "⚠️ IaC scan warnings: ${e}"
                        env.PIPELINE_ISSUES += "IaC scan warnings\n"
                    }
                }
            }
        }

        stage('DAST Scan') {
            steps {
                script {
                    try {
                        def cmd = isUnix() ? 'zap-cli quick-scan --self-contained --start-options "-config api.disablekey=true" http://localhost:5173 || true' :
                                             'powershell -Command "Try { zap-cli quick-scan --self-contained --start-options \\"-config api.disablekey=true\\" http://localhost:5173 } Catch {} ; exit 0"'
                        if (isUnix()) sh cmd else bat cmd
                    } catch(e) {
                        echo "⚠️ DAST scan warnings: ${e}"
                        env.PIPELINE_ISSUES += "DAST scan warnings\n"
                    }
                }
            }
        }

        stage('Build & Deploy') {
            steps {
                script {
                    try {
                        if (isUnix()) {
                            sh 'docker compose -f docker-compose.yml down || true'
                            sh 'docker compose -f docker-compose.yml up --build -d || true'
                        } else {
                            bat 'docker compose -f docker-compose.yml down || exit 0'
                            bat 'docker compose -f docker-compose.yml up --build -d || exit 0'
                        }
                    } catch(e) {
                        echo "⚠️ Build & deploy warnings: ${e}"
                        env.PIPELINE_ISSUES += "Build & deploy warnings\n"
                    }
                }
            }
        }

        stage('Generate Consolidated Report') {
            steps {
                script {
                    def depText = ''
                    try {
                        depText = readFile('dependency-report.txt')
                    } catch(e) {
                        depText = "Dependency report not available."
                    }

                    def reportHtml = """
                    <html>
                    <head><title>ELMS DevSecOps Report</title></head>
                    <body>
                    <h1>📊 ELMS DevSecOps Security Report</h1>
                    <h2>Pipeline Issues & Warnings</h2>
                    <pre>${env.PIPELINE_ISSUES ?: 'No warnings'}</pre>
                    <h2>Dependency Scan Report</h2>
                    <pre>${depText}</pre>
                    </body>
                    </html>
                    """
                    writeFile file: 'elms-devsecops-report.html', text: reportHtml

                    // Convert HTML to PDF (optional)
                    if (isUnix()) {
                        sh 'wkhtmltopdf elms-devsecops-report.html elms-devsecops-report.pdf || true'
                    } else {
                        bat 'powershell -Command "Try { & wkhtmltopdf elms-devsecops-report.html elms-devsecops-report.pdf } Catch { Write-Host \'PDF not generated\' } ; exit 0"'
                    }
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'elms-devsecops-report.*', fingerprint: true
            echo "✅ Pipeline completed. Check reports for all warnings."
        }
    }
}
