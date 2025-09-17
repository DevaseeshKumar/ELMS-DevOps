pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'elms-app'
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
        REPORT_DIR = 'reports'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'collab',
                    credentialsId: 'your-github-credentials-id',
                    url: 'https://github.com/DevaseeshKumar/ELMS-DevOps.git'
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

        stage('Build Backend') {
            steps {
                dir("${BACKEND_DIR}") {
                    bat "npm install"
                    echo "⚡ Starting backend with nodemon..."
                    bat "start /B npx nodemon server.js"
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {
                    bat "npm install"
                    bat "npm run build"
                }
            }
        }

        stage('Package Scan - Backend') {
            steps {
                script {
                    bat "mkdir ${REPORT_DIR} || exit 0"
                    // Run Snyk and save JSON report
                    def snykCmd = "cd /d ${env.BACKEND_DIR} && npx snyk test --severity-threshold=high --json 1>..\\${REPORT_DIR}\\backend-snyk.json"
                    bat snykCmd
                    // Check if vulnerabilities exist
                    def report = readFile("${REPORT_DIR}\\backend-snyk.json")
                    if (report.contains('"vulnerabilities":{') && !report.contains('"vulnerabilities":{}')) {
                        error "❌ High vulnerabilities found in backend packages!"
                    }
                }
            }
        }

        stage('Package Scan - Frontend') {
            steps {
                script {
                    def snykCmd = "cd /d ${env.FRONTEND_DIR} && npx snyk test --severity-threshold=high --json 1>..\\${REPORT_DIR}\\frontend-snyk.json"
                    bat snykCmd
                    def report = readFile("${REPORT_DIR}\\frontend-snyk.json")
                    if (report.contains('"vulnerabilities":{') && !report.contains('"vulnerabilities":{}')) {
                        error "❌ High vulnerabilities found in frontend packages!"
                    }
                }
            }
        }

        stage('Generate Snyk HTML Report') {
            steps {
                script {
                    echo '📄 Generating Snyk HTML reports...'
                    bat "mkdir ${REPORT_DIR} || exit 0"
                    bat "npx snyk-to-html -i ${REPORT_DIR}\\backend-snyk.json -o ${REPORT_DIR}\\backend-snyk.html || exit /b 0"
                    bat "npx snyk-to-html -i ${REPORT_DIR}\\frontend-snyk.json -o ${REPORT_DIR}\\frontend-snyk.html || exit /b 0"
                    echo '✅ Snyk HTML reports generated.'
                }
            }
        }

        stage('Build & Deploy Containers') {
            steps {
                script {
                    def downCmd = 'docker compose -f docker-compose.yml down || exit 0'
                    def upCmd = 'docker compose -f docker-compose.yml up --build -d'
                    bat downCmd
                    bat upCmd
                }
            }
        }

        stage('Container Security Scan') {
            steps {
                echo '🛡️ Container security scan placeholder (implement Trivy/Clair here)'
            }
        }
    }

    post {
        always {
            echo '📂 Archiving Snyk HTML reports...'
            archiveArtifacts artifacts: 'reports/*.html', allowEmptyArchive: true
        }
        failure {
            script {
                echo '❌ Pipeline failed. Generating failure report...'
                bat "mkdir ${REPORT_DIR} || exit 0"
                def failureMessage = "Pipeline failed at stage: ${env.STAGE_NAME}\nCheck Jenkins console logs for details.\nRefer to Snyk reports for vulnerabilities."
                writeFile file: "${REPORT_DIR}/failure-report.txt", text: failureMessage
                archiveArtifacts artifacts: "${REPORT_DIR}/failure-report.txt", allowEmptyArchive: true
            }
            cleanWs()
        }
        success {
            echo '✅ Pipeline completed successfully!'
        }
    }
}
