pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'elms-app'
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
        REPORT_DIR = 'reports'
    }

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
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

        stage('Install & Scan Backend Packages') {
            steps {
                script {
                    bat "mkdir ${REPORT_DIR} || exit 0"
                    bat "cd /d ${BACKEND_DIR} && npm install"
                    bat "cd /d ${BACKEND_DIR} && npx snyk test --json 1>..\\${REPORT_DIR}\\backend-snyk.json || exit /b 0"
                }
            }
        }

        stage('Install & Scan Frontend Packages') {
            steps {
                script {
                    bat "cd /d ${FRONTEND_DIR} && npm install"
                    bat "cd /d ${FRONTEND_DIR} && npx snyk test --json 1>..\\${REPORT_DIR}\\frontend-snyk.json || exit /b 0"
                }
            }
        }

        stage('Secret Scanning') {
            steps {
                script {
                    bat "gitleaks detect --source . --report=${REPORT_DIR}\\gitleaks-report.json || exit /b 0"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    bat "docker build -t ${DOCKER_IMAGE_NAME} ."
                }
            }
        }

        stage('Container Security Scan') {
            steps {
                script {
                    bat "trivy image --format json -o ${REPORT_DIR}\\docker-trivy.json ${DOCKER_IMAGE_NAME} || exit /b 0"
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    bat "docker compose -f docker-compose.yml down || exit 0"
                    bat "docker compose -f docker-compose.yml up --build -d"
                }
            }
        }

        stage('Generate HTML Report') {
            steps {
                script {
                    bat "python scripts\\generate_html_report.py --input ${REPORT_DIR} --output ${REPORT_DIR}\\html\\report.html"
                }
                publishHTML([
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: "${REPORT_DIR}\\html",
                    reportFiles: 'report.html',
                    reportName: 'DevSecOps Full Scan Report'
                ])
            }
        }
    }

    post {
        failure {
            echo '❌ Pipeline failed. Check Jenkins logs.'
            cleanWs()
        }
    }
}
