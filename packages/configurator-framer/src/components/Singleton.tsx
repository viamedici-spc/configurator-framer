import {PropsWithChildren, useEffect, useRef, useState} from "react"

type SingletonCandidate = {
    chose: () => void
}

type Singleton = {
    chosen: SingletonCandidate
    candidates: Set<SingletonCandidate>
}

const singletons = new Map<string, Singleton>()

/*
    Only one Singleton will be rendered based on the singletonId.
    The singletons are global. No manager is required.
    When a singleton gets unmounted, another one is tried to be chosen.
 */
export default function Singleton(
    props: PropsWithChildren<{ singletonId: string }>
) {
    const {singletonId, children} = props
    const [isChosen, setIsChosen] = useState(false)
    const ref = useRef<SingletonCandidate>({chose: () => setIsChosen(true)})

    useEffect(() => {
        addCandidate(singletonId, ref.current)
        return () => removeCandidate(singletonId, ref.current)
    }, [])

    return isChosen ? <>{children}</> : null
}

function addCandidate(singletonId: string, candidate: SingletonCandidate) {
    const singleton = getOrAddSingleton(singletonId)
    singleton.candidates.add(candidate)
    ensureSingletonChosen(singletonId)
}

function removeCandidate(singletonId: string, candidate: SingletonCandidate) {
    let singleton = singletons.get(singletonId)
    if (singleton == null) {
        return
    }
    singleton.candidates.delete(candidate)

    if (singleton.chosen === candidate) {
        singleton.chosen = null
    }

    cleanUpSingleton(singletonId)
    ensureSingletonChosen(singletonId)
}

function ensureSingletonChosen(singletonId: string) {
    let singleton = singletons.get(singletonId)
    if (singleton == null || singleton.chosen != null) {
        return
    }

    const nextCandidate = singleton.candidates.values().next()
        .value as SingletonCandidate
    if (nextCandidate == null) {
        return
    }

    singleton.chosen = nextCandidate
    nextCandidate.chose()
}

function cleanUpSingleton(singletonId: string) {
    let singleton = singletons.get(singletonId)
    if (singleton == null || singleton.candidates.size > 0) {
        return
    }

    singletons.delete(singletonId)
}

function getOrAddSingleton(singletonId: string) {
    let singleton = singletons.get(singletonId)
    if (singleton == null) {
        singleton = {chosen: null, candidates: new Set<SingletonCandidate>()}
        singletons.set(singletonId, singleton)
    }
    return singleton
}