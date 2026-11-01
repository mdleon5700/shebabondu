const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');

let part2 = '\n' +
'  // Copy Candidate Data for Teletalk\n' +
'  const handleCopyCandidateData = (app: ApplicationRequest) => {\n' +
'    const formattedData = "[TELETALK AUTO-FILL DATA]\\n" +\n' +
'      "Name: " + app.candidateName + "\\n" +\n' +
'      "Phone: " + app.candidatePhone + "\\n" +\n' +
'      "District: " + app.candidateDistrict + "\\n" +\n' +
'      "Job: " + app.jobTitle + "\\n" +\n' +
'      "Post: " + app.postName + "\\n" +\n' +
'      "Government Fee: ?" + (app.governmentFee || 200) + "\\n" +\n' +
'      "Tracking ID: " + app.id;\n' +
'    navigator.clipboard.writeText(formattedData);\n' +
'    setCopiedCandidateId(app.id);\n' +
'    setTimeout(() => setCopiedCandidateId(null), 2500);\n' +
'  };\n\n' +
'  // Approve Payment via API\n' +
'  const handleApprovePayment = async (appId: string) => {\n' +
'    try {\n' +
'      const res = await fetch("/api/applications/" + appId, {\n' +
'        method: "PATCH",\n' +
'        headers: { "Content-Type": "application/json" },\n' +
'        body: JSON.stringify({\n' +
'          status: "processing",\n' +
'          verificationType: "admin_verified",\n' +
'          notes: "?????/??? ??????? ???????? ?????? ????????? ??? ??????? ???????? ????? ??? ?????"\n' +
'        })\n' +
'      });\n' +
'      const data = await res.json();\n' +
'      if (data.success) {\n' +
'        setApplications(prev => prev.map(a => a.id === appId ? data.application : a));\n' +
'        loadAdminData();\n' +
'        alert("??????? ??????? ??????? ? ???????? ?????!");\n' +
'      } else {\n' +
'        alert(data.error || "?????? ?????");\n' +
'      }\n' +
'    } catch (err: any) {\n' +
'      alert(err.message);\n' +
'    }\n' +
'  };\n\n' +
'  // Complete Order & Upload PDF via API\n' +
'  const handleCompleteOrder = async (appId: string) => {\n' +
'    const pdfUrl = prompt("Applicant Copy PDF ???? ??? (??????):", "https://alljobs.teletalk.com.bd/applicant-copy/" + appId + ".pdf");\n' +
'    try {\n' +
'      const res = await fetch("/api/applications/" + appId, {\n' +
'        method: "PATCH",\n' +
'        headers: { "Content-Type": "application/json" },\n' +
'        body: JSON.stringify({\n' +
'          status: "completed",\n' +
'          verificationType: "officially_verified",\n' +
'          applicantCopyPdfUrl: pdfUrl || undefined,\n' +
'          notes: "????????? ?????? ????? ??????? ??? ??????????????? ??? ????? ??? ??????"\n' +
'        })\n' +
'      });\n' +
'      const data = await res.json();\n' +
'      if (data.success) {\n' +
'        setApplications(prev => prev.map(a => a.id === appId ? data.application : a));\n' +
'        loadAdminData();\n' +
'        alert("????? ??????? ??????? ????? ??? ????????? ??????????? ????? ???? ???????? ?????!");\n' +
'      } else {\n' +
'        alert(data.error || "?????? ?????");\n' +
'      }\n' +
'    } catch (err: any) {\n' +
'      alert(err.message);\n' +
'    }\n' +
'  };\n\n' +
'  // Publish New Job via API\n' +
'  const handlePublishJob = async (e: React.FormEvent) => {\n' +
'    e.preventDefault();\n' +
'    setPublishStatus("????? ??? ?????...");\n' +
'    try {\n' +
'      const res = await fetch("/api/admin/jobs", {\n' +
'        method: "POST",\n' +
'        headers: { "Content-Type": "application/json" },\n' +
'        body: JSON.stringify({\n' +
'          title: newTitle,\n' +
'          organization: newOrg,\n' +
'          category: newCategory,\n' +
'          grade: newGrade,\n' +
'          totalPosts: Number(newPosts),\n' +
'          salary: newSalary,\n' +
'          minEducation: newEducation,\n' +
'          deadline: newDeadline,\n' +
'          govtFee: Number(newGovtFee),\n' +
'          serviceFee: Number(newServiceFee),\n' +
'          districts: newDistricts\n' +
'        })\n' +
'      });\n' +
'      const data = await res.json();\n' +
'      if (data.success) {\n' +
'        setPublishStatus("???! ??????????? ???? ???????? ????? ?????" + (shareToFacebook ? " ??? ?????? ????" : "") + (shareToTelegram ? " ? ??????????" : "") + " ????? ??? ?????!");\n' +
'        setNewTitle("");\n' +
'        setNewOrg("");\n' +
'        loadAdminData();\n' +
'      } else {\n' +
'        alert(data.error || "????? ?????? ?????");\n' +
'        setPublishStatus(null);\n' +
'      }\n' +
'    } catch (err: any) {\n' +
'      alert(err.message);\n' +
'      setPublishStatus(null);\n' +
'    }\n' +
'  };\n\n' +
'  const handleApproveDraft = async (draftId: string) => {\n' +
'    try {\n' +
'      const res = await fetch("/api/admin/sources/drafts", {\n' +
'        method: "POST",\n' +
'        headers: { "Content-Type": "application/json" },\n' +
'        body: JSON.stringify({ action: "approve", draftId })\n' +
'      });\n' +
'      const data = await res.json();\n' +
'      if (data.success) {\n' +
'        alert("?????? ??????? ???? ?????????? ?????????? ?????!");\n' +
'        loadAdminData();\n' +
'      }\n' +
'    } catch (err: any) {\n' +
'      alert(err.message);\n' +
'    }\n' +
'  };\n\n' +
'  const handleRejectDraft = async (draftId: string) => {\n' +
'    if (!confirm("???? ?? ?? ?????? ??????????? ????? ???? ????")) return;\n' +
'    try {\n' +
'      const res = await fetch("/api/admin/sources/drafts", {\n' +
'        method: "POST",\n' +
'        headers: { "Content-Type": "application/json" },\n' +
'        body: JSON.stringify({ action: "reject", draftId })\n' +
'      });\n' +
'      const data = await res.json();\n' +
'      if (data.success) {\n' +
'        alert("???????? ????? ??? ??????");\n' +
'        loadAdminData();\n' +
'      }\n' +
'    } catch (err: any) {\n' +
'      alert(err.message);\n' +
'    }\n' +
'  };\n';

fs.writeFileSync(path.join(__dirname, 'admin_part2.txt'), part2, 'utf8');
console.log('Saved admin_part2.txt');
