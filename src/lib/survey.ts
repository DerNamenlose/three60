
export function fromFormData(formData: FormData) {
    const participants = formData.getAll('participants').filter(email => !!email).map(email => email.toString());
    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString();
    const skillTitles = formData.getAll('skill');
    const skillDescriptions = formData.getAll('skill-description');

    const skills = skillTitles.flatMap((title, index) => !!title ? [({
        title: title.toString(),
        description: skillDescriptions[index].toString()
    })] : []);

    return {
        participants,
        title,
        description,
        skills
    }
}