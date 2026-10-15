/**
 * PATRÓN: Uso de herramientas - Tool use
 * ---------------------------
 * El catálogo de cursos NO está en el entrenamiento
 * del modelo. Sin herramientas, el modelo inventa precios y cursos con
 * total confianza o en su defecto, no hace nada.
 * Con herramientas, consulta el dato real.
 */

import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { createTracer, model } from '../../helpers/index.js';

// ---------------------------------------------------------------------------
//  LA "BASE DE DATOS" — datos que el modelo no puede conocer
// ---------------------------------------------------------------------------

type Course = {
    id: string;
    title: string;
    hours: number;
    priceUSD: number;
    level: 'basic' | 'intermediate' | 'advanced';
    students: number;
};

const COURSE_CATALOG: Course[] = [
    {
        id: 'ts-01',
        title: 'TypeScript desde cero',
        hours: 22,
        priceUSD: 19.99,
        level: 'basic',
        students: 48_120,
    },
    {
        id: 'nest-02',
        title: 'NestJS: API REST modular',
        hours: 31,
        priceUSD: 24.99,
        level: 'intermediate',
        students: 22_450,
    },
    {
        id: 'flu-03',
        title: 'Flutter: apps multiplataforma',
        hours: 46,
        priceUSD: 29.99,
        level: 'intermediate',
        students: 61_300,
    },
    {
        id: 'agt-04',
        title: 'Agentes de IA con TypeScript',
        hours: 18,
        priceUSD: 34.99,
        level: 'advanced',
        students: 1_890,
    },
    {
        id: 'dkr-05',
        title: 'Docker para desarrolladores',
        hours: 14,
        priceUSD: 17.99,
        level: 'basic',
        students: 35_770,
    },
];

const QUESTION = '¿Cuánto costarían juntos el curso de TypeScript y el de Docker' +
    'Con un 20% de descuento? Dame también las horas totales'




// ---------------------------------------------------------------------------
//  1) LLAMADA SIN HERRAMIENTAS (NO HACE NADA ÚTIL)
// ---------------------------------------------------------------------------
const withoutTools = async () => {

    const tracer = createTracer('without-tools')
    const { text } = await generateText({
        model: model,
        prompt: QUESTION,
        onStepFinish: tracer.onStepFinish,
    })

    console.log('\n Respuesta SIN TOOLS: ', text.green)
    return tracer.summary()
}







// ---------------------------------------------------------------------------
// 2) LLAMADA CON HERRAMIENTAS (CÁLCULO REAL)
// ---------------------------------------------------------------------------


const findCourses = tool({
    description: 'Busca cursos en el catálogo por texto, ' +
        'por título o por nivel, Utilízala siempre antes de responder' +
        'cualquier pregunta sobre cursos, precio, cantidad de alumnos.',
    inputSchema: z.object({
        text: z.string().optional().describe('Texto a buscar en el título del cusro'),
        level: z.enum(['basic', 'intermediate', 'advanced']).optional().describe('Nivel de los diferentes cursos')
    }),
    execute: async ({ text, level }: { text?: string, level?: string }) => {
        let filtered = [...COURSE_CATALOG]
        if (text) {
            filtered = filtered.filter(course =>
                course.title.toLowerCase().includes(text.toLowerCase()))
        }
        if (level) {
            filtered = filtered.filter(course =>
                course.level === level)
        }

        return {
            found: filtered.length,
            data: filtered
        }

    }
})

const withTools = async () => {

    const tracer = createTracer('with-tools')

    const { text } = await generateText({
        model,
        prompt: QUESTION,
        tools: { findCourses },
        stopWhen: stepCountIs(6),
        onStepEnd: tracer.onStepFinish,
    })

    console.log('\n Respuesta CON TOOLS: ', text.green);
    return tracer.summary();
}




// ---------------------------------------------------------------------------
// LLAMADA PRINCIPAL
// ---------------------------------------------------------------------------
export const withoutToolsMain = async () => {
    const resultA = await withoutTools()
    const resultB = await withTools()

    console.log('\n========COMPARAITVA========')
    console.table({
        'Sin herramientas': resultA,
        'Con herramientas': resultB
    })
}