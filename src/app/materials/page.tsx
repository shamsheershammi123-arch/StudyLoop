'use client';

import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Trash2,
  Plus,
  HelpCircle,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { ExtractedCandidateTask, UploadedMaterial } from '@/lib/types';
import { SAMPLE_MATERIALS } from '@/lib/sampleData';
import { StudyStore } from '@/lib/store';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<UploadedMaterial[]>([]);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [selectedSample, setSelectedSample] = useState<string>('');
  const [extractedTasks, setExtractedTasks] = useState<ExtractedCandidateTask[] | null>(null);
  const [activeCourseGuess, setActiveCourseGuess] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [manualText, setManualText] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    setMaterials(StudyStore.getMaterials());
  }, []);

  // Process text through server-side Gemini route
  const handleExtract = async (text: string, fileName: string) => {
    setIsExtracting(true);
    setStatusMessage('Analyzing material with Gemini 3.8 Flash...');
    setUploadProgress(40);

    try {
      const res = await fetch('/api/gemini/extract-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, fileName }),
      });

      setUploadProgress(80);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Extraction failed');
      }

      setUploadProgress(100);
      setExtractedTasks(data.tasks);
      setActiveCourseGuess(data.courseGuess || 'General Course');
      setStatusMessage(
        data.usedAI
          ? 'Gemini successfully extracted candidate milestones with source citations.'
          : 'Extracted candidate milestones using deterministic heuristic parser.'
      );

      // Save material record
      StudyStore.addMaterial({
        id: `mat_${Date.now()}`,
        fileName,
        fileType: fileName.endsWith('.pdf') ? 'pdf' : 'text',
        fileSize: text.length * 2,
        uploadedAt: new Date().toISOString(),
        status: 'extracted',
        courseGuess: data.courseGuess,
        extractedTasksCount: data.tasks.length,
        rawExcerpt: data.rawExcerpt,
      });

      setMaterials(StudyStore.getMaterials());
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Extraction notice: ${err.message}. You can still enter or edit tasks manually.`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSampleSelect = (sampleId: string) => {
    const sample = SAMPLE_MATERIALS.find((s) => s.id === sampleId);
    if (!sample) return;
    setSelectedSample(sampleId);
    handleExtract(sample.content, `${sample.course}_Syllabus.pdf`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      handleExtract(text, file.name);
    };
    reader.readAsText(file);
  };

  // Toggle selection of a candidate task
  const toggleSelectTask = (index: number) => {
    if (!extractedTasks) return;
    const updated = [...extractedTasks];
    updated[index].selected = !updated[index].selected;
    setExtractedTasks(updated);
  };

  // Edit field in candidate task
  const updateCandidateTask = (index: number, patch: Partial<ExtractedCandidateTask>) => {
    if (!extractedTasks) return;
    const updated = [...extractedTasks];
    updated[index] = { ...updated[index], ...patch };
    setExtractedTasks(updated);
  };

  // Add a manual item to the review table
  const handleAddManualCandidate = () => {
    if (!extractedTasks) {
      setExtractedTasks([]);
    }
    const today = new Date();
    today.setDate(today.getDate() + 7);
    const dateStr = today.toISOString().split('T')[0];

    const newTask: ExtractedCandidateTask = {
      title: 'New Assignment / Milestone',
      course: activeCourseGuess || 'CS 201',
      dueDate: dateStr,
      estimatedHours: 3.0,
      priority: 'medium',
      requiredMaterials: ['Notes'],
      instructions: 'Self-directed study milestone',
      pageReference: 'Manual Entry',
      needsReview: false,
      selected: true,
    };

    setExtractedTasks([...(extractedTasks || []), newTask]);
  };

  // Save confirmed tasks to store
  const handleSaveConfirmedTasks = () => {
    if (!extractedTasks) return;
    const selected = extractedTasks.filter((t) => t.selected);

    if (selected.length === 0) {
      alert('Please select at least one task to save.');
      return;
    }

    selected.forEach((t) => {
      StudyStore.addTask({
        title: t.title,
        courseId: `course_${t.course.toLowerCase().replace(/\s+/g, '')}`,
        courseName: t.course,
        dueDate: t.dueDate,
        estimatedHours: t.estimatedHours,
        priority: t.priority,
        status: 'not_started',
        sourceDocumentName: selectedSample ? 'Syllabus.pdf' : 'Uploaded_Material.pdf',
        sourceExcerpt: t.sourceExcerpt,
        pageReference: t.pageReference,
        needsReview: t.needsReview,
        reviewReason: t.reviewReason,
        priorityRationale: `Extracted from ${t.pageReference || 'syllabus'}; requires ~${t.estimatedHours}h effort.`,
        requiredMaterials: t.requiredMaterials,
        instructions: t.instructions,
        subtasks: [
          { id: `st_${Date.now()}_1`, title: 'Gather lecture notes & rubrics', completed: false },
          { id: `st_${Date.now()}_2`, title: 'Core implementation / problem set', completed: false },
          { id: `st_${Date.now()}_3`, title: 'Final proofing & review', completed: false },
        ],
      });
    });

    alert(`Successfully added ${selected.length} tasks to your study plan!`);
    setExtractedTasks(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Study Materials & Syllabus AI Extraction
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Upload your syllabus, exam schedule, or assignment prompt. Gemini will identify upcoming deadlines, effort estimates, and source citations for your review before adding them to your schedule.
        </p>
      </div>

      {/* Upload & Quick-Test Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* File Upload Zone */}
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center min-h-[220px]">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Upload Syllabus or Timetable
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mt-1 mb-4">
            Supports PDF, images, or text documents. Files are stored securely and never made public.
          </p>

          <label className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors">
            <span>Browse File</span>
            <input
              type="file"
              accept=".pdf,.txt,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* 1-Click Quick Test Materials */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Instant 1-Click Test Materials
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Testing the hackathon prototype? Click any pre-loaded course material below to run the extraction pipeline immediately.
            </p>

            <div className="space-y-2.5">
              {SAMPLE_MATERIALS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSampleSelect(sample.id)}
                  disabled={isExtracting}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                    selectedSample === sample.id
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-semibold block">{sample.course}</span>
                      <span className="text-[11px] text-slate-500">{sample.title}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Processing State */}
      {isExtracting && (
        <div className="p-6 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-3 animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
          <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
            {statusMessage}
          </h4>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            Cross-referencing assignment dates, weighting, and extracting page references...
          </p>
        </div>
      )}

      {/* Candidate Tasks Review Table (Requirement 2) */}
      {extractedTasks && !isExtracting && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Review Extracted Tasks
                </span>
                <span className="text-xs text-slate-500">
                  Course: <strong className="text-slate-800 dark:text-slate-200">{activeCourseGuess}</strong>
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                Confirm, edit, or reject before saving
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddManualCandidate}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>

              <button
                onClick={handleSaveConfirmedTasks}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Confirmed Tasks</span>
              </button>
            </div>
          </div>

          {/* Table / Cards */}
          <div className="space-y-4">
            {extractedTasks.map((task, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  task.selected
                    ? 'border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={task.selected}
                    onChange={() => toggleSelectTask(idx)}
                    className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />

                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => updateCandidateTask(idx, { title: e.target.value })}
                        className="font-semibold text-sm text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none flex-1"
                      />

                      <div className="flex items-center gap-2 shrink-0 text-xs">
                        {task.needsReview && (
                          <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Needs Review
                          </span>
                        )}
                        <span className="font-mono text-slate-500">{task.pageReference}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Course</label>
                        <input
                          type="text"
                          value={task.course}
                          onChange={(e) => updateCandidateTask(idx, { course: e.target.value })}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Due Date</label>
                        <input
                          type="date"
                          value={task.dueDate}
                          onChange={(e) => updateCandidateTask(idx, { dueDate: e.target.value })}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Effort (Hours)</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={task.estimatedHours}
                          onChange={(e) =>
                            updateCandidateTask(idx, { estimatedHours: parseFloat(e.target.value) })
                          }
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Priority</label>
                        <select
                          value={task.priority}
                          onChange={(e) =>
                            updateCandidateTask(idx, { priority: e.target.value as any })
                          }
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>

                    {/* Source Excerpt */}
                    {task.sourceExcerpt && (
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-slate-800 dark:text-slate-300">
                          Source Quote:
                        </span>{' '}
                        "{task.sourceExcerpt}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Materials History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Uploaded Materials History ({materials.length})
        </h3>

        <div className="space-y-3">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{mat.fileName}</div>
                  <div className="text-[11px] text-slate-500">
                    {mat.courseGuess && <span className="font-medium">{mat.courseGuess} • </span>}
                    {mat.extractedTasksCount} tasks identified • Uploaded{' '}
                    {new Date(mat.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  StudyStore.deleteMaterial(mat.id);
                  setMaterials(StudyStore.getMaterials());
                }}
                className="text-slate-400 hover:text-rose-500 p-1 rounded-lg"
                title="Remove uploaded material"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

