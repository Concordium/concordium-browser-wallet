/* eslint-disable react/function-component-definition, react/destructuring-assignment */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import Modal from './Modal';

export default {
    title: 'Shared/Modal',
    component: Modal,
} as ComponentMeta<typeof Modal>;

const Template: ComponentStory<typeof Modal> = (args) => {
    return (
        <div style={{ width: 300, height: 400 }}>
            <style>{`body {width:fit-content;}`}</style>
            <Modal {...args} />
        </div>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    children: <>Modal content</>,
    open: true,
};

export const WallOfText = Template.bind({});
WallOfText.args = {
    children: (
        <>
            <h1>Lorem ipsum!</h1>
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Tincidunt nunc pulvinar sapien et. Mattis aliquam faucibus purus in. Tristique
                sollicitudin nibh sit amet commodo nulla facilisi. Eget nullam non nisi est sit amet. At lectus urna
                duis convallis. Consequat semper viverra nam libero. Gravida rutrum quisque non tellus orci ac auctor.
                Mattis aliquam faucibus purus in massa tempor nec feugiat. Consectetur adipiscing elit duis tristique
                sollicitudin. Sit amet est placerat in egestas erat imperdiet sed euismod. Ornare massa eget egestas
                purus viverra. Viverra maecenas accumsan lacus vel facilisis. Malesuada fames ac turpis egestas integer
                eget aliquet nibh. Non diam phasellus vestibulum lorem sed risus. Tincidunt vitae semper quis lectus
                nulla. Cursus euismod quis viverra nibh cras pulvinar mattis nunc sed.
            </p>
            <p>
                Commodo quis imperdiet massa tincidunt nunc pulvinar sapien et ligula. Vitae congue mauris rhoncus
                aenean vel elit scelerisque mauris pellentesque. Nec feugiat in fermentum posuere urna. Lobortis
                scelerisque fermentum dui faucibus in ornare quam. Sit amet est placerat in egestas erat imperdiet sed
                euismod. Nulla aliquet porttitor lacus luctus accumsan tortor posuere. Arcu risus quis varius quam.
                Ullamcorper a lacus vestibulum sed arcu non odio. Eu mi bibendum neque egestas. Duis at consectetur
                lorem donec.
            </p>
            <p>
                Hendrerit dolor magna eget est lorem ipsum dolor sit amet. Dignissim sodales ut eu sem. Tellus molestie
                nunc non blandit massa enim nec. Amet nulla facilisi morbi tempus iaculis urna. Metus vulputate eu
                scelerisque felis imperdiet proin. Mauris ultrices eros in cursus turpis massa tincidunt dui ut.
                Praesent tristique magna sit amet purus gravida quis blandit turpis. Turpis nunc eget lorem dolor sed
                viverra ipsum. Et egestas quis ipsum suspendisse ultrices gravida. Egestas diam in arcu cursus euismod
                quis. Egestas purus viverra accumsan in. Convallis convallis tellus id interdum. Donec pretium vulputate
                sapien nec sagittis. Consectetur adipiscing elit ut aliquam purus sit amet luctus venenatis.
            </p>
            <p>
                Eget gravida cum sociis natoque penatibus et. Tincidunt eget nullam non nisi est. Amet mattis vulputate
                enim nulla. Eget mi proin sed libero enim sed faucibus turpis in. Mattis ullamcorper velit sed
                ullamcorper. Nunc vel risus commodo viverra. At tellus at urna condimentum mattis. At elementum eu
                facilisis sed odio. Egestas dui id ornare arcu. Proin libero nunc consequat interdum varius. Scelerisque
                eleifend donec pretium vulputate sapien nec.
            </p>
            <p>
                Eget velit aliquet sagittis id consectetur purus ut faucibus pulvinar. Sapien eget mi proin sed libero
                enim. Eget velit aliquet sagittis id consectetur. Est placerat in egestas erat. Diam maecenas ultricies
                mi eget mauris pharetra et ultrices neque. Ut sem nulla pharetra diam sit amet nisl suscipit adipiscing.
                Curabitur vitae nunc sed velit dignissim sodales ut eu sem. Adipiscing at in tellus integer feugiat
                scelerisque varius. Ultrices mi tempus imperdiet nulla malesuada pellentesque elit eget. Quisque
                sagittis purus sit amet volutpat. Dignissim diam quis enim lobortis scelerisque fermentum dui. At lectus
                urna duis convallis convallis tellus id. Ultrices dui sapien eget mi proin sed.
            </p>
        </>
    ),
    open: true,
};

export const Error = Template.bind({});
Error.args = {
    children: <>Modal content</>,
    open: true,
    error: true,
};

export const Trigger = Template.bind({});
Trigger.args = {
    children: <>Modal content</>,
    trigger: <button type="button">Open modal</button>,
};
