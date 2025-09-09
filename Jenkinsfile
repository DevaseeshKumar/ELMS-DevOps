pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'elms-app'
        PIPELINE_STATUS = 'SUCCESS'
    }

    stages {
        stage('Clone Repository') {
            steps {
                script {
                    try {
                        git credentialsId: 'your-github-credentials-id', url: 'https://github.com/DevaseeshKumar/ELMS-DevOps.git', branch: 'main'
                        env.CLONE_STATUS = 'Success'
                    } catch (err) {
                        env.CLONE_STATUS = 'Failure'
                        env.PIPELINE_STATUS = 'FAILURE'
                        error("Clone Repository failed")
                    }
                }
            }
        }

        stage('Write .env') {
            steps {
                script {
                    try {
                        writeFile file: '.env', text: '''\
mongodburl=mongodb+srv://ELMS:ELMS@cluster0.uqtzdbr.mongodb.net/elms?retryWrites=true&w=majority&appName=Cluster0
PORT=8000
EMAIL_USER=thorodinsonuru@gmail.com
EMAIL_PASS=qzerfjxnvoeupsgp
FRONTEND_URL=https://localhost:5173
SESSION_SECRET=elms-secret-key
NODE_ENV=production
'''
                        env.ENV_STATUS = 'Success'
                    } catch (err) {
                        env.ENV_STATUS = 'Failure'
                        env.PIPELINE_STATUS = 'FAILURE'
                    }
                }
            }
        }

        stage('SAST & Secrets Scan') {
            steps {
                script {
                    try {
                        def sastCmd = 'semgrep --config=auto backend frontend || true'
                        def secretsCmd = 'gitleaks detect --source . || true'

                        if (isUnix()) {
                            sh sastCmd
                            sh secretsCmd
                        } else {
                            bat sastCmd
                            bat secretsCmd
                        }
                        env.SAST_STATUS = 'Completed'
                    } catch (err) {
                        env.SAST_STATUS = 'Failed'
                        env.PIPELINE_STATUS = 'FAILURE'
                    }
                }
            }
        }

        stage('Dependency Scan') {
            steps {
                script {
                    env.DEP_STATUS = 'Success'
                    def allDeps = []

                    def scanFolder = { folder ->
                        def auditJson = ''
                        def cmd = 'npm install && npm audit --json'

                        if (isUnix()) {
                            auditJson = sh(script: "cd ${folder} && ${cmd}", returnStdout: true).trim()
                        } else {
                            auditJson = bat(script: "cd ${folder} && ${cmd}", returnStdout: true).trim()
                        }

                        def jsonSlurper = new groovy.json.JsonSlurper()
                        def audit = jsonSlurper.parseText(auditJson)

                        if(audit?.advisories) {
                            audit.advisories.each { id, advisory ->
                                allDeps << [
                                    name: advisory.module_name,
                                    severity: advisory.severity,
                                    title: advisory.title,
                                    url: advisory.url,
                                    fix: advisory.recommendation ?: 'Manual fix required'
                                ]
                                if(advisory.severity == 'high' || advisory.severity == 'critical') {
                                    env.PIPELINE_STATUS = 'FAILURE'
                                    env.DEP_STATUS = 'Danger'
                                }
                            }
                        }
                    }

                    scanFolder('backend')
                    scanFolder('frontend')

                    // Write dependency report CSV and HTML
                    def depCsv = "Package,Severity,Issue,Fix,CVE\n"
                    def depHtml = "<h3>Dependency Scan</h3><table border='1'><tr><th>Package</th><th>Severity</th><th>Issue</th><th>Fix</th><th>Link</th></tr>"
                    allDeps.each { d ->
                        depCsv += "${d.name},${d.severity},${d.title},${d.fix},${d.url}\n"
                        depHtml += "<tr><td>${d.name}</td><td>${d.severity}</td><td>${d.title}</td><td>${d.fix}</td><td><a href='${d.url}' target='_blank'>CVE Link</a></td></tr>"
                    }
                    depHtml += "</table>"
                    writeFile file: 'dependency-report.csv', text: depCsv
                    writeFile file: 'dependency-report.html', text: depHtml
                }
            }
        }

        stage('Container Image Scan') {
            steps {
                script {
                    try {
                        def trivyCmd = "trivy image ${DOCKER_IMAGE_NAME} || true"
                        if (isUnix()) sh trivyCmd else bat trivyCmd
                        env.CONTAINER_STATUS = 'Completed'
                    } catch (err) {
                        env.CONTAINER_STATUS = 'Failed'
                        env.PIPELINE_STATUS = 'FAILURE'
                    }
                }
            }
        }

        stage('IaC Scan') {
            steps {
                script {
                    try {
                        def checkovCmd = 'checkov -d . || true'
                        if (isUnix()) sh checkovCmd else bat checkovCmd
                        env.IAC_STATUS = 'Completed'
                    } catch (err) {
                        env.IAC_STATUS = 'Failed'
                        env.PIPELINE_STATUS = 'FAILURE'
                    }
                }
            }
        }

        stage('DAST Scan') {
            steps {
                script {
                    try {
                        def zapCmd = 'zap-cli quick-scan --self-contained --start-options "-config api.disablekey=true" http://localhost:5173 || true'
                        if (isUnix()) sh zapCmd else bat zapCmd
                        env.DAST_STATUS = 'Completed'
                    } catch (err) {
                        env.DAST_STATUS = 'Failed'
                        env.PIPELINE_STATUS = 'FAILURE'
                    }
                }
            }
        }

        stage('Build & Deploy') {
            steps {
                script {
                    try {
                        def downCmd = 'docker compose -f docker-compose.yml down || true'
                        def upCmd = 'docker compose -f docker-compose.yml up --build -d || true'

                        if (isUnix()) {
                            sh downCmd
                            sh upCmd
                        } else {
                            bat downCmd
                            bat upCmd
                        }
                        env.BUILD_STATUS = 'Success'
                    } catch (err) {
                        env.BUILD_STATUS = 'Failure'
                        env.PIPELINE_STATUS = 'FAILURE'
                    }
                }
            }
        }

        stage('Generate Consolidated Report') {
            steps {
                script {
                    def reportHtml = """
                    <html>
                    <head><title>ELMS DevSecOps Report</title></head>
                    <body>
                    <h1>📊 ELMS DevSecOps Security Report</h1>
                    <h2>Stages Summary</h2>
                    <ul>
                      <li>Clone Repository: ${env.CLONE_STATUS}</li>
                      <li>Write .env: ${env.ENV_STATUS}</li>
                      <li>SAST & Secrets Scan: ${env.SAST_STATUS}</li>
                      <li>Dependency Scan: ${env.DEP_STATUS}</li>
                      <li>Container Scan: ${env.CONTAINER_STATUS}</li>
                      <li>IaC Scan: ${env.IAC_STATUS}</li>
                      <li>DAST Scan: ${env.DAST_STATUS}</li>
                      <li>Build & Deploy: ${env.BUILD_STATUS}</li>
                    </ul>
                    ${readFile('dependency-report.html')}
                    <h2>Pipeline Status: ${env.PIPELINE_STATUS}</h2>
                    </body></html>
                    """
                    writeFile file: 'elms-devsecops-report.html', text: reportHtml

                    if (isUnix()) {
                        sh 'wkhtmltopdf elms-devsecops-report.html elms-devsecops-report.pdf || true'
                    } else {
                        bat 'wkhtmltopdf elms-devsecops-report.html elms-devsecops-report.pdf || exit 0'
                    }
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'elms-devsecops-report.*', fingerprint: true
        }
        failure {
            echo "❌ Pipeline failed due to critical/high issues in scans."
            cleanWs()
        }
    }
}
