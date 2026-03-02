// hooks/useReviewSession.ts
import { useState, useEffect, useMemo } from "react";
import { StudyItemFullResponse } from "@/features/discipline";
import { SessionType } from "@/features/reviews/pages/ReviewSessionSetup";
import { QuestionType, StudyItemType } from "@/types/types";

export function useReviewSession(rawItems: StudyItemFullResponse[], sessionType: SessionType) {
    const [seconds, setSeconds] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answeredIds, setAnsweredIds] = useState<Set<number>>(new Set());
    const [isFinished, setIsFinished] = useState(false);

    const markAsFinished = (id: number, Difficulty_easy?: boolean) => {
        if (!Difficulty_easy) return;
        setAnsweredIds(prev => new Set(prev).add(id));
    };

    useEffect(() => {
        if (isFinished) return;
        
        const interval = setInterval(() => setSeconds(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, [isFinished]);

    const sessionItems = useMemo(() => {
        let filtered = [...rawItems];

        if (sessionType === "CARD") {
            filtered = rawItems.filter(i => i.item_type === StudyItemType.CARD);
        } else if (sessionType === "OBJECTIVE") {
            filtered = rawItems.filter(i => i.item_type === StudyItemType.QUESTION && i.question?.question.question_type === QuestionType.OBJECTIVE);
        } else if (sessionType === "DISCURSIVE") {
            filtered = rawItems.filter(i => i.item_type === StudyItemType.QUESTION && i.question?.question.question_type === QuestionType.DISCURSIVE);
        }

        return filtered.sort(() => Math.random() - 0.5);
    }, [rawItems, sessionType]);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const nextItem = () => {
        if (currentIndex < sessionItems.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    const prevItem = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };


    return {
        seconds,
        formatTime,
        currentIndex,
        sessionItems,
        nextItem,
        prevItem,
        answeredIds,
        markAsFinished,
        progress: sessionItems.length > 0 ? ((currentIndex + 1) / sessionItems.length) * 100 : 0,
        currentItem: sessionItems[currentIndex],
        isFinished,
        setIsFinished
    };
}