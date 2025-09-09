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
                    def isWindows = !isUnix()
                    if (isWindows) {
                        bat "cd /d ${BACKEND_DIR} && npm install"
                        bat "cd /d ${BACKEND_DIR} && snyk test --json > ..\\${REPORT_DIR}\\backend-snyk.json || exit /b 0"
                    } else {
                        sh "mkdir -p ${REPORT_DIR}"
                        sh "cd ${BACKEND_DIR} && npm install"
                        sh "cd ${BACKEND_DIR} && snyk test --json > ../${REPORT_DIR}/backend-snyk.json || true"
                    }
                }
            }
        }

        stage('Install & Scan Frontend Packages') {
            steps {
                script {
                    def isWindows = !isUnix()
                    if (isWindows) {
                        bat "cd /d ${FRONTEND_DIR} && npm install"
                        bat "cd /d ${FRONTEND_DIR} && snyk test --json > ..\\${REPORT_DIR}\\frontend-snyk.json || exit /b 0"
                    } else {
                        sh "cd ${FRONTEND_DIR} && npm install"
                        sh "cd ${FRONTEND_DIR} && snyk test --json > ../${REPORT_DIR}/frontend-snyk.json || true"
                    }
                }
            }
        }

        stage('Secret Scanning') {
            steps {
                script {
                    def isWindows = !isUnix()
                    if (isWindows) {
                        bat "gitleaks detect --source . --report=${REPORT_DIR}\\gitleaks-report.json || exit /b 0"
                    } else {
                        sh "gitleaks detect --source . --report=${REPORT_DIR}/gitleaks-report.json || true"
                    }
                }
            }
        }

        stage('Static Code Analysis') {
            steps {
                script {
                    def isWindows = !isUnix()
                    if (isWindows) {
                        bat "eslint ${BACKEND_DIR} --format json -o ${REPORT_DIR}\\eslint-backend.json || exit /b 0"
                        bat "eslint ${FRONTEND_DIR} --format json -o ${REPORT_DIR}\\eslint-frontend.json || exit /b 0"
                    } else {
                        sh "eslint ${BACKEND_DIR} --format json -o ${REPORT_DIR}/eslint-backend.json || true"
                        sh "eslint ${FRONTEND_DIR} --format json -o ${REPORT_DIR}/eslint-frontend.json || true"
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def isWindows = !isUnix()
                    if (isWindows) {
                        bat "docker build -t ${DOCKER_IMAGE_NAME} ."
                    } else {
                        sh "docker build -t ${DOCKER_IMAGE_NAME} ."
                    }
                }
            }
        }

        stage('Container Security Scan') {
            steps {
                script {
                    def isWindows = !isUnix()
                    if (isWindows) {
                        bat "trivy image --format json -o ${REPORT_DIR}\\docker-trivy.json ${DOCKER_IMAGE_NAME} || exit /b 0"
                    } else {
                        sh "trivy image --format json -o ${REPORT_DIR}/docker-trivy.json ${DOCKER_IMAGE_NAME} || true"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    def isWindows = !isUnix()
                    def downCmd = "docker compose -f docker-compose.yml down || exit 0"
                    def upCmd = "docker compose -f docker-compose.yml up --build -d"

                    if (isWindows) {
                        bat downCmd
                        bat upCmd
                    } else {
                        sh downCmd
                        sh upCmd
                    }
                }
            }
        }

        stage('Generate HTML Report') {
            steps {
                script {
                    sh """
                    mkdir -p ${REPORT_DIR}/html
                    python3 scripts/generate_html_report.py --input ${REPORT_DIR} --output ${REPORT_DIR}/html/report.html
                    """
                }
                publishHTML([
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: "${REPORT_DIR}/html",
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
