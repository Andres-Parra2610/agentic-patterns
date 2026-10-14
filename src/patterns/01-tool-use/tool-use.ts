import { generateText } from "ai"
import { model } from "../../helpers/selected-model.js"
import { createTracer } from "../../helpers/create-tracer.js"

const QUESTION = '¿Cuánto costarían juntos el curso de TypeScript y el de Docker' +
    'Con un 20% de descuento? Dame también las horas totales'


const withoutTools = async () => {

    const tracer = createTracer('without-tools')
    const { text } = await generateText({
        model: model,
        prompt: QUESTION,
        onStepFinish: tracer.onStepFinish,
    })

    console.log('\n Respuesta: ', text.green)
    return tracer.summary()
}


export const withoutToolsMain = async () => {
    const resultA = await withoutTools()

    console.log('\n========COMPARAITVA========')
    console.table({
        'Sin herramientas': resultA
    })
}